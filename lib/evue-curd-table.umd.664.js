((typeof self !== 'undefined' ? self : this)["webpackChunkevue_curd_table"] = (typeof self !== 'undefined' ? self : this)["webpackChunkevue_curd_table"] || []).push([[664],{

/***/ 1120:
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "export_table_to_excel": function() { return /* binding */ export_table_to_excel; },
/* harmony export */   "export_json_to_excel": function() { return /* binding */ export_json_to_excel; }
/* harmony export */ });
/* harmony import */ var core_js_modules_es_typed_array_at_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(8675);
/* harmony import */ var core_js_modules_es_typed_array_at_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_typed_array_at_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var core_js_modules_es_typed_array_sort_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(3824);
/* harmony import */ var core_js_modules_es_typed_array_sort_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_typed_array_sort_js__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var file_saver__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(9879);
/* harmony import */ var file_saver__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(file_saver__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var xlsx__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(6382);
/* harmony import */ var xlsx__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(xlsx__WEBPACK_IMPORTED_MODULE_3__);



/* eslint-disable */



function generateArray(table) {
  var out = [];
  var rows = table.querySelectorAll('tr');
  var ranges = [];

  for (var R = 0; R < rows.length; ++R) {
    var outRow = [];
    var row = rows[R];
    var columns = row.querySelectorAll('td');

    for (var C = 0; C < columns.length; ++C) {
      var cell = columns[C];
      var colspan = cell.getAttribute('colspan');
      var rowspan = cell.getAttribute('rowspan');
      var cellValue = cell.innerText;
      if (cellValue !== "" && cellValue == +cellValue) cellValue = +cellValue; //Skip ranges

      ranges.forEach(function (range) {
        if (R >= range.s.r && R <= range.e.r && outRow.length >= range.s.c && outRow.length <= range.e.c) {
          for (var i = 0; i <= range.e.c - range.s.c; ++i) outRow.push(null);
        }
      }); //Handle Row Span

      if (rowspan || colspan) {
        rowspan = rowspan || 1;
        colspan = colspan || 1;
        ranges.push({
          s: {
            r: R,
            c: outRow.length
          },
          e: {
            r: R + rowspan - 1,
            c: outRow.length + colspan - 1
          }
        });
      }

      ; //Handle Value

      outRow.push(cellValue !== "" ? cellValue : null); //Handle Colspan

      if (colspan) for (var k = 0; k < colspan - 1; ++k) outRow.push(null);
    }

    out.push(outRow);
  }

  return [out, ranges];
}

;

function datenum(v, date1904) {
  if (date1904) v += 1462;
  var epoch = Date.parse(v);
  return (epoch - new Date(Date.UTC(1899, 11, 30))) / (24 * 60 * 60 * 1000);
}

function sheet_from_array_of_arrays(data, opts) {
  var ws = {};
  var range = {
    s: {
      c: 10000000,
      r: 10000000
    },
    e: {
      c: 0,
      r: 0
    }
  };

  for (var R = 0; R != data.length; ++R) {
    for (var C = 0; C != data[R].length; ++C) {
      if (range.s.r > R) range.s.r = R;
      if (range.s.c > C) range.s.c = C;
      if (range.e.r < R) range.e.r = R;
      if (range.e.c < C) range.e.c = C;
      var cell = {
        v: data[R][C]
      };
      if (cell.v == null) continue;
      var cell_ref = xlsx__WEBPACK_IMPORTED_MODULE_3___default().utils.encode_cell({
        c: C,
        r: R
      });
      if (typeof cell.v === 'number') cell.t = 'n';else if (typeof cell.v === 'boolean') cell.t = 'b';else if (cell.v instanceof Date) {
        cell.t = 'n';
        cell.z = (xlsx__WEBPACK_IMPORTED_MODULE_3___default().SSF._table[14]);
        cell.v = datenum(cell.v);
      } else cell.t = 's';
      ws[cell_ref] = cell;
    }
  }

  if (range.s.c < 10000000) ws['!ref'] = xlsx__WEBPACK_IMPORTED_MODULE_3___default().utils.encode_range(range);
  return ws;
}

function Workbook() {
  if (!(this instanceof Workbook)) return new Workbook();
  this.SheetNames = [];
  this.Sheets = {};
}

function s2ab(s) {
  var buf = new ArrayBuffer(s.length);
  var view = new Uint8Array(buf);

  for (var i = 0; i != s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;

  return buf;
}

function export_table_to_excel(id) {
  var theTable = document.getElementById(id);
  var oo = generateArray(theTable);
  var ranges = oo[1];
  /* original data */

  var data = oo[0];
  var ws_name = "SheetJS";
  var wb = new Workbook(),
      ws = sheet_from_array_of_arrays(data);
  /* add ranges to worksheet */
  // ws['!cols'] = ['apple', 'banan'];

  ws['!merges'] = ranges;
  /* add worksheet to workbook */

  wb.SheetNames.push(ws_name);
  wb.Sheets[ws_name] = ws;
  var wbout = xlsx__WEBPACK_IMPORTED_MODULE_3___default().write(wb, {
    bookType: 'xlsx',
    bookSST: false,
    type: 'binary'
  });
  (0,file_saver__WEBPACK_IMPORTED_MODULE_2__.saveAs)(new Blob([s2ab(wbout)], {
    type: "application/octet-stream"
  }), "test.xlsx");
}
function export_json_to_excel({
  multiHeader = [],
  header,
  data,
  filename,
  merges = [],
  autoWidth = true,
  bookType = 'xlsx'
} = {}) {
  /* original data */
  filename = filename || 'excel-list';
  data = [...data];
  data.unshift(header);

  for (let i = multiHeader.length - 1; i > -1; i--) {
    data.unshift(multiHeader[i]);
  }

  var ws_name = "SheetJS";
  var wb = new Workbook(),
      ws = sheet_from_array_of_arrays(data);

  if (merges.length > 0) {
    if (!ws['!merges']) ws['!merges'] = [];
    merges.forEach(item => {
      ws['!merges'].push(xlsx__WEBPACK_IMPORTED_MODULE_3___default().utils.decode_range(item));
    });
  }

  if (autoWidth) {
    /*??????worksheet?????????????????????*/
    const colWidth = data.map(row => row.map(val => {
      /*??????????????????null/undefined*/
      if (val == null) {
        return {
          'wch': 10
        };
      }
      /*????????????????????????*/
      else if (val.toString().charCodeAt(0) > 255) {
        return {
          'wch': val.toString().length * 2
        };
      } else {
        return {
          'wch': val.toString().length
        };
      }
    }));
    /*????????????????????????*/

    let result = colWidth[0];

    for (let i = 1; i < colWidth.length; i++) {
      for (let j = 0; j < colWidth[i].length; j++) {
        if (result[j]['wch'] < colWidth[i][j]['wch']) {
          result[j]['wch'] = colWidth[i][j]['wch'];
        }
      }
    }

    ws['!cols'] = result;
  }
  /* add worksheet to workbook */


  wb.SheetNames.push(ws_name);
  wb.Sheets[ws_name] = ws;
  var wbout = xlsx__WEBPACK_IMPORTED_MODULE_3___default().write(wb, {
    bookType: bookType,
    bookSST: false,
    type: 'binary'
  });
  (0,file_saver__WEBPACK_IMPORTED_MODULE_2__.saveAs)(new Blob([s2ab(wbout)], {
    type: "application/octet-stream"
  }), `${filename}.${bookType}`);
}

/***/ }),

/***/ 5382:
/***/ (function() {

/* (ignored) */

/***/ }),

/***/ 2095:
/***/ (function() {

/* (ignored) */

/***/ }),

/***/ 1219:
/***/ (function() {

/* (ignored) */

/***/ })

}]);