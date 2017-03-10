var oldRecords;
var oldDateRecord;
var newRecords;
var newDateRecord;
var headingFields;
var delim;

function parseFile(e) {
  var rawRecords = e.target.result.split('\n');
  var records = {};
  var temp;
  headingFields = parseRecord(rawRecords.shift());

  rawRecords.forEach(function(record) {
    temp = parseRecord(record);
    if (records.hasOwnProperty(temp[0])) {
      if (temp[0]) {
        console.log('course id duplicate', temp);
      }
    } else {
      if (!Number.isNaN(parseInt(temp[0]))) {
        records[temp[0]] = temp;
      }
    }
  });

  return records;
}

function parseRecord(headings) {
  var fields = headings.split(',');
  fields = fields.map(function(str) {
    return str.replace(/\"/g, '');
  });
  return fields;
}

function selectedOriginalFile (e) {
  var fileReader = new FileReader();
  var file = document.getElementById('original-file').files[0];

  fileReader.addEventListener('loadend', function(e) {
    oldRecords = parseFile(e);
    console.log(oldRecords);
    oldDateRecord = oldRecords[oldRecords.length-2];
    oldRecords = oldRecords.slice(0, oldRecords.length-7);
  });

  fileReader.readAsText(file);
}

function selectedNewFile (e) {
  var fileReader = new FileReader();
  var file = document.getElementById('new-file').files[0];

  fileReader.addEventListener('loadend', function(e) {
    newRecords = parseFile(e);
    newDateRecord = newRecords[newRecords.length-2];
    newRecords = newRecords.slice(0, newRecords.length-7);
  });

  fileReader.readAsText(file);
}

function findAdditions(first, second) {
  var results = {};
  for (var courseId in second) {
    if (!first.hasOwnProperty(courseId)) {
      // new record
      results[courseId] = second[courseId];
    }
  }

  return results;
}

function findChanges(first, second) {
  var results = {};
  var isChanged = [];
  for (var courseId in second) {
    isChanged = [];
    if (first.hasOwnProperty(courseId)) {
      // has same id, validate other fields
      if (first[courseId].length === second[courseId].length) {
        for (var i = 0; i < first[courseId].length; i++) {
          if (first[courseId][i] !== second[courseId][i]) {
            isChanged.push(i);
          }
        }

        if (isChanged > 0) {
          results[courseId] = {
            record: second[courseId],
            changes: isChanged.slice()
          };
        }
      }
    }
  }

  return results;
}

function showHeadings() {
  var tableRow = document.createElement('tr');
  headingFields.forEach(function(field) {
    var heading = document.createElement('th');
    var text = document.createTextNode(field);
    heading.appendChild(text);
    tableRow.appendChild(heading);
  });

  return tableRow;
}

function viewChanges(changes) {
  var table = document.createElement('table');
  table.appendChild(showHeadings());
  for (var courseId in changes) {
    var tableRow = document.createElement('tr');
    changes[courseId].record.forEach(function(field) {
      var tableData = document.createElement('td');
      var text = document.createTextNode(field);
      tableData.appendChild(text);
      tableRow.appendChild(tableData);
    });
    changes[courseId].changes.forEach(function(change) {
      console.log(changes[courseId].record[change]);
      tableRow.children[change].classList.add('changed');
    });
    table.appendChild(tableRow);
  }

  return table;
}

function viewAdditions(table, additions, type) {
  for (var courseId in additions) {
    var tableRow = document.createElement('tr');
    tableRow.classList.add(type);
    additions[courseId].forEach(function(field) {
      var tableData = document.createElement('td');
      var text = document.createTextNode(field);
      tableData.appendChild(text);
      tableRow.appendChild(tableData);
    });
    table.appendChild(tableRow);
  }

  return table;
}

function validate(e) {
  var additions = findAdditions(oldRecords, newRecords);
  var removals = findAdditions(newRecords, oldRecords);
  var changes = findChanges(oldRecords, newRecords);

  console.log('additions', additions);
  console.log('removals', removals);
  console.log('changes', changes);
  var table = viewChanges(changes);
  table = viewAdditions(table, additions, 'added');
  table = viewAdditions(table, removals, 'removed');
  document.getElementById('results').appendChild(table);
}

document.getElementById('original-file').addEventListener('change', selectedOriginalFile);
document.getElementById('new-file').addEventListener('change', selectedNewFile);
document.getElementById('validate').addEventListener('click', validate);
