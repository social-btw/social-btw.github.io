const ENDPOINTS = {
  'slayer': 'https://api.wiseoldman.net/v2/competitions/25465/csv?table=participants',
  'thieving': 'https://api.wiseoldman.net/v2/competitions/25464/csv?table=participants',
  'firemaking': 'https://api.wiseoldman.net/v2/competitions/25463/csv?table=participants',
  'construction': 'https://api.wiseoldman.net/v2/competitions/25462/csv?table=participants',
  'agility': 'https://api.wiseoldman.net/v2/competitions/25461/csv?table=participants',
}

const renderRow = (rowNum, username, score) => {
  const tbody = document.getElementById('personal-hiscores__tbody');

  const row = document.createElement('tr');
  row.className = 'personal-hiscores__row';
  tbody.appendChild(row);

  const rowCell = document.createElement('td');
  rowCell.className = 'right';
  rowCell.innerText = rowNum;

  const nameCell = document.createElement('td');
  nameCell.className = 'left';
  nameCell.innerText = username;


  const paddingCell = document.createElement('td');

  const scoreCell = document.createElement('td');
  scoreCell.className = 'right';
  scoreCell.innerText = score;

  row.appendChild(rowCell);
  row.appendChild(nameCell);
  row.appendChild(paddingCell);
  row.appendChild(scoreCell);
}

const getScores = (limit, skill) => {
  let scores = {};
  let requests = [];
  const endpoints = skill ? [ENDPOINTS[skill]] : Object.values(ENDPOINTS)

  endpoints.forEach(url => {
    requests.push(fetch(url)
      .then(response => response.text())
      .then(body => {
        let rows = CSVToArray(body);
        rows.shift();

        rows.forEach(row => {
          let currentScore = scores[row[1]] || 0;

          scores[row[1]] = currentScore + parseInt(row[4]);
        })
      }));
  })

  Promise.all(requests)
    .then(() => {
      let sortable = [];
      for (var user in scores) {
        sortable.push([user, scores[user]]);
      }

      sortable.sort(function (a, b) {
        return b[1] - a[1];
      });

      document.getElementById("personal-hiscores__loading").remove();
      sortable.slice(0, limit).forEach((value, index) => {
        renderRow(index + 1, value[0], value[1].toLocaleString());
      })
    })
    .catch(e => {
      renderRow('', 'Too many requests! Try again in 5 minutes please', '🐇');
    })
}


// ref: http://stackoverflow.com/a/1293163/2343
// This will parse a delimited string into an array of
// arrays. The default delimiter is the comma, but this
// can be overriden in the second argument.
function CSVToArray(strData, strDelimiter) {
  // Check to see if the delimiter is defined. If not,
  // then default to comma.
  strDelimiter = (strDelimiter || ",");

  // Create a regular expression to parse the CSV values.
  var objPattern = new RegExp(
    (
      // Delimiters.
      "(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +

      // Quoted fields.
      "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +

      // Standard fields.
      "([^\"\\" + strDelimiter + "\\r\\n]*))"
    ),
    "gi"
  );


  // Create an array to hold our data. Give the array
  // a default empty first row.
  var arrData = [[]];

  // Create an array to hold our individual pattern
  // matching groups.
  var arrMatches = null;


  // Keep looping over the regular expression matches
  // until we can no longer find a match.
  while (arrMatches = objPattern.exec(strData)) {

    // Get the delimiter that was found.
    var strMatchedDelimiter = arrMatches[1];

    // Check to see if the given delimiter has a length
    // (is not the start of string) and if it matches
    // field delimiter. If id does not, then we know
    // that this delimiter is a row delimiter.
    if (
      strMatchedDelimiter.length &&
      strMatchedDelimiter !== strDelimiter
    ) {

      // Since we have reached a new row of data,
      // add an empty row to our data array.
      arrData.push([]);

    }

    var strMatchedValue;

    // Now that we have our delimiter out of the way,
    // let's check to see which kind of value we
    // captured (quoted or unquoted).
    if (arrMatches[2]) {

      // We found a quoted value. When we capture
      // this value, unescape any double quotes.
      strMatchedValue = arrMatches[2].replace(
        new RegExp("\"\"", "g"),
        "\""
      );

    } else {

      // We found a non-quoted value.
      strMatchedValue = arrMatches[3];

    }


    // Now that we have our value string, let's add
    // it to the data array.
    arrData[arrData.length - 1].push(strMatchedValue);
  }

  // Return the parsed data.
  return (arrData);
}
