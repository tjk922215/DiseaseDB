module.exports = function(sqlConnect) {
  var dbOperation = new Object();

  dbOperation.queryByReportId = function(reportid) {
    return new Promise(function(resolve, reject) {
      sqlConnect.query('SELECT * FROM `Basic sources` WHERE ReportID = ' +
        sqlConnect.escape(reportid),
        function(err, rows, fields) {
          if (err) reject(err);
          resolve(rows);
        });
    });
  }

  dbOperation.queryByDescription = function(disease, country, year, checked) {
    return new Promise(function(resolve, reject) {
      var rowSQL = 'SELECT * FROM `Basic sources` WHERE';
      //  TODO: 无害化处理，防止SQL注入攻击
      if (disease != null) {
        rowSQL += ' `Disease` = \'' + disease + '\'';
      }
      if (country != null && disease != null) {
        rowSQL += ' AND `Country` = \'' + country + '\'';
      } else if (country != null && disease == null) {
        rowSQL += ' `Country` = \'' + country + '\'';
      }
      if (year != null && country == null && disease == null) {
        rowSQL += ' `Year of Pub` = ' + year;
      } else if (year != null && !(country == null && disease == null)) {
        rowSQL += ' AND `Year of Pub` = ' + year;
      }
      if (checked != null && year == null && country == null && disease == null) {
        rowSQL += ' `checked` = \'' + checked + '\'';
      } else if (checked != null && !(year == null && country == null && disease == null)) {
        rowSQL += ' AND `checked` = \'' + checked + '\'';
      }
      console.log(rowSQL);
      sqlConnect.query(rowSQL, function(err, rows, fields) {
        if (err) reject(err);
        resolve(rows);
      });
    });
  }

  dbOperation.queryTree = function(type, id) {
    return new Promise(function(resolve, reject) {
      var rowSQl = null;
      if (type === 'Basic Sources') {
        rowSQl = 'SELECT * FROM `Basic Sources` WHERE `ReportID`=' + id;
      } else if (type == 'Survey Description') {
        rowSQl = 'SELECT * FROM `Survey Description` WHERE `Basic sources_ReportID`=' + id;
      } else if (type == 'Location Information') {
        rowSQl = 'SELECT * FROM `Location Information` WHERE `Survey description_SurveyID`=' + id;
      } else if (type == 'Disease Data') {
        rowSQl = 'SELECT * FROM `Disease data` WHERE `Location information_LocationID1`=' + id;
      } else if (type == 'Intervention Data') {
        rowSQl = 'SELECT * FROM `Intervention Data` WHERE `Disease data_DiseaseID`=' + id;
      } else {
        console.log('type error');
      }
      console.log(rowSQl);
      sqlConnect.query(rowSQl, function(err, rows, fields) {
        if (err) reject(err);
        resolve(rows);
      });
    });
  }
  dbOperation.check = function(type, id) {
    return new Promise(function(resolve, reject) {
      var rowSQl = null;
      if (type == 'Survey Description') {
        rowSQl = 'SELECT * FROM `Basic sources` WHERE `ReportID`=' + id;
      } else if (type == 'Location Information') {
        rowSQl = 'SELECT * FROM `Survey description` WHERE `SurveyID`=' + id;
      } else if (type == 'Disease Data') {
        rowSQl = 'SELECT * FROM `Location information` WHERE `LocationID1`=' + id;
      } else if (type == 'Intervention Data') {
        rowSQl = 'SELECT * FROM `` WHERE `DiseaseID`=' + id;
      }
      sqlConnect.query(rowSQl, function(err, rows, fields) {
        if (err) reject(err);
        resolve(rows);
      });
    });
  }
  dbOperation.add = function(args, type) {
    return new Promise(function(resolve, reject) {
      var rowSQl = null;
      var columns = null;
      if (type == 'Basic Sources') {
        columns = '`ReportID`,`Reporter`,`Disease`,`Country`,`Document Category`,`Journal`,' +
          '`Title`,`Authors`,`Year of Pub`,`Volume`,`Issue`,`Page from`,`Page to`,' +
          '`Author contact needed`,`Open access`,`checked`,`note1`';
        rowSQl = 'insert into `Basic Sources` (' + columns + ') values(' + args + ')';
      } else if (type == 'Survey Description') {
        columns = '`SurveyID`,`Basic sources_ReportID`,`Data type`,`Survey type`,' +
          '`Month start`,`Month finish`,`Year start`,`Year finish`,`note2`';
        rowSQl = 'insert into `Survey description` (' + columns + ') values(' + args + ')';
      } else if (type == 'Location Information') {
        columns = '`LocationID`,`Survey description_Basic sources_ReportID`,`Survey description_SurveyID`,' +
          '`ADM1`,`ADM2`,`ADM3`,`Point name`,`Point type`,`Latitude`,`Longitude`,`Geo-reference sources`,`note3`';
        rowSQl = 'insert into `Location information` (' + columns + ') values(' + args + ')';
      } else if (type == 'Disease Data') {
        columns = '`DiseaseID`,`Location information_LocationID`,`Species`,`Diagnostic_symptoms`,' +
          '`Diagnostic_blood`,`Diagnostic_skin`,`Diagnostic_stool`,`Num_samples`,`Num_specimen`,' +
          '`AgeLower`,`AgeUpper`,`Num_examine`,`Num_positive`,`Percent_positive`,`Num_examine_male`,' +
          '`Num_positive_male`,`Percent_positive_male`,`Num_examine_female`,`Num_positive_female`,' +
          '`Percent_positive_female`,`note4`,`Location information_LocationID1`,`L_ReportID`,' +
          '`Location information_Survey description_SurveyID`';
        rowSQl = 'insert into `Disease data` (' + columns + ') values(' + args + ')';
      } else if (type == 'Intervention Data') {
        columns = '`InterventionID`,`Group`,`Months after baseline`,`Drug`,`Frequency per year`,`Period (months)`,' +
          '`Coverage`,`Other method`,`I_Num_examine`,`I_Num_positive`,`I_Percent_positive`,' +
          '`I_Num_examine_male`,`I_Num_positive_male`,`I_Percent_positive_male`,`I_Num_examine_female`,' +
          '`I_Num_positive_female`,`I_Percent_positive_female`,`note5`,`Disease data_DiseaseID`,' +
          '`Disease data_Location information_LocationID1`,`Disease data_L_ReportID`,' +
          '`Disease data_Location information_Survey description_SurveyID`';
        rowSQl = 'insert into `Intervention data` (' + columns + ') values(' + args + ')';
      }
      console.log(rowSQl);
      sqlConnect.query(rowSQl, function(err, rows, fields) {
        if (err) reject(err);
        resolve(rows);
      });
    });
  }

  dbOperation.delete = function(type, id) {
    //console.log(type);
    if (type == 'Basic Sources') {
      return new Promise(function(resolve, reject) {
        var deletesql = 'delete from `Intervention data` where `Disease data_Location information_LocationID1`=' + id + ';';
        var deletesql2 = 'delete from `Disease data` where `L_ReportID` = ' + id + ';';
        var deletesql3 = 'delete from `Location information` where `Survey description_Basic sources_ReportID` = ' + id + ';';
        var deletesql4 = 'delete from `Survey description` where `Basic sources_ReportID`= ' + id + ';';
        var deletesql5 = 'delete from `Basic sources` where `ReportID` = ' + id + ';';
        sqlConnect.query(deletesql);
        sqlConnect.query(deletesql2);
        sqlConnect.query(deletesql3);
        sqlConnect.query(deletesql4);
        sqlConnect.query(deletesql5, function(err, rows, fields) {
          if (err) reject(err);
          resolve(rows);
        });
      });
    } else if (type == 'Survey Description') {
      return new Promise(function(resolve, reject) {
        var deletesql = 'delete from `Intervention data` where `Disease data_Location information_Survey description_SurveyID`=' + id
        var deletesql2 = 'delete from `disease data` where `Location information_Survey description_SurveyID` = ' + id + ';';
        var deletesql3 = 'delete from `Location information` where `Survey description_SurveyID` = ' + id + ';';
        var deletesql4 = 'delete from `Survey description` where `SurveyID`= ' + id + ';';
        sqlConnect.query(deletesql);
        sqlConnect.query(deletesql2);
        sqlConnect.query(deletesql3);
        sqlConnect.query(deletesql4, function(err, rows, fields) {
          if (err) reject(err);
          resolve(rows);
        });
      });
    } else if (type == 'Location Information') {
      return new Promise(function(resolve, reject) {
        var deletesql = 'delete from `Intervention data` where `Disease data_Location information_LocationID1`=' + id + ';';
        var deletesql2 = 'delete from `disease data` where `Location information_LocationID` =' + id + ';';
        var deletesql3 = 'delete from `Location information` where `LocationID` = ' + id + ';';
        sqlConnect.query(deletesql);
        sqlConnect.query(deletesql2);
        sqlConnect.query(deletesql3, function(err, rows, fields) {
          if (err) reject(err);
          resolve(rows);
        });
      });
    } else if (type == 'Disease Data') {
      return new Promise(function(resolve, reject) {
        var deletesql = 'delete from `Intervention data` where `Disease data_DiseaseID`=' + id + ';';
        var deletesql2 = 'delete from `Disease data` where `DiseaseID` = ' + id + ';';
        sqlConnect.query(deletesql);
        sqlConnect.query(deletesql2, function(err, rows, fields) {
          if (err) reject(err);
          resolve(rows);
        });
      });
    } else {
      return new Promise(function(resolve, reject) {
        var deletesql = 'delete from `Intervention data` where `InterventionID`=' + id + ';';
        sqlConnect.query(deletesql, function(err, rows, fields) {
          if (err) reject(err);
          resolve(rows);
        });
      });
    }
  }
  //-----------------getid---------------------------------
  dbOperation.getMaxID = function(type) {
    var selectStr = '';
    if (type == 'Basic Sources') {
      selectStr = 'select MAX(ReportID) as ID from `basic sources`';
    } else if (type == 'Survey Description') {
      selectStr = 'select MAX(SurveyID) as ID from `survey description`';
    } else if (type == 'Location Information') {
      selectStr = 'select MAX(LocationID) as ID from `location information`';
    } else if (type == 'Disease Data') {
      selectStr = 'select MAX(DiseaseID) as ID from `disease data`';
    } else if (type == 'Intervention Data') {
      selectStr = 'select MAX(InterventionID) as ID from `intervention data`';
    } else {
      console.log('type error');
      selectStr = '';
    }
    return new Promise(function(resolve, reject) {
      sqlConnect.query(selectStr, function(err, rows, fields) {
        if (err) reject(err);
        resolve(rows);
      });
    });
  }
  //  获取整棵id树，传入根ID
  dbOperation.getIDTree = function(id) {
    var rawSqlS = 'SELECT `SurveyID` '
                + 'FROM `Survey Description` WHERE `Basic sources_ReportID` = ?'
    var rawSqlL = 'SELECT `Survey description_SurveyID`'
                + ',`LocationID` FROM `Location Information`'
                + ' WHERE `Survey description_Basic sources_ReportID` = ?'
    var rawSqlD = 'SELECT `Location information_Survey description_SurveyID` '
                + ',`Location information_LocationID1`'
                + ',`DiseaseID` '
                + 'FROM `Disease Data` WHERE `L_ReportID` = ?'
    var rawSqlI = 'SELECT `Disease data_Location information_Survey description_SurveyID`'
                + ',`Disease data_Location information_LocationID1`'
                + ',`Disease data_DiseaseID`'
                + ',`InterventionID` '
                + 'FROM `Intervention data` WHERE `Disease data_L_ReportID` = ?'
    var pS = new Promise((resolve, reject) => {
      sqlConnect.query(rawSqlS, [id], function(err, rows, fields) {
        if (err) reject(err)
        resolve(rows)
      })
    })
    var pL = new Promise((resolve, reject) => {
      sqlConnect.query(rawSqlL, [id], function(err, rows, fields) {
        if (err) reject(err)
        resolve(rows)
      })
    })
    var pD = new Promise((resolve, reject) => {
      sqlConnect.query(rawSqlD, [id], function(err, rows, fields) {
        if (err) reject(err)
        resolve(rows)
      })
    })
    var pI = new Promise((resolve, reject) => {
      sqlConnect.query(rawSqlI, [id], function(err, rows, fields) {
        if (err) reject(err)
        resolve(rows)
      })
    })
    return Promise.all([pS, pL, pD, pI])
  }

  dbOperation.getIdContent = function(id, type) {
    var rawSql = ''
    if (type === 'Basic Sources') {
      rawSql = 'SELECT * FROM `Basic Sources` WHERE `ReportID`=' + id;
    } else if (type == 'Survey Description') {
      rawSql = 'SELECT * FROM `Survey Description` WHERE `SurveyID`=' + id;
    } else if (type == 'Location Information') {
      rawSql = 'SELECT * FROM `Location Information` WHERE `LocationID`=' + id;
    } else if (type == 'Disease Data') {
      rawSql = 'SELECT * FROM `Disease data` WHERE `DiseaseID`=' + id;
    } else if (type == 'Intervention Data') {
      rawSql = 'SELECT * FROM `Intervention Data` WHERE `InterventionID`=' + id;
    } else {
      console.log('type error');
    }
    return new Promise((resolve, reject) => {
      sqlConnect.query(rawSql, function(err, rows, fields) {
        if (err) reject(err);
        resolve(rows);
      });
    })
  }

  // dbOperation.update = function(args,type){
  //   return new Promise(function(resolve,reject){
  //     var rowSQl = null;
  //     var columns = null;
  //     if (type == 'Basic sources' ){
  //       columns = '`Reporter`,`Disease``Country`,`Document Category`,'+
  //       '`Journal`,`Title`,`Authors`,`Year of Pub`,`Volume`,`Issue`,`Page from`,'+
  //       '`Page to`,`Author contact needed`,`Open access`,`checked`,`note1`';
  //       rowSQl = 'update ';
  //     }
  //     else if (type == 'Survey Description'){
  //       columns = '`Basic sources_ReportID`,`Data type`,`Survey type`,'+
  //       '`Month start`,`Month finish`,`Year start`,`Year finish`,`note2`';
  //       rowSQl = 'insert into `Survey description` ('+ columns +') values('+args+')';
  //     }
  //     else if (type == 'Location Information') {
  //       columns = '`Survey description_Basic sources_ReportID`,`Survey description_SurveyID`,'+
  //       '`ADM1`,`ADM2`,`ADM3`,`Point name`,`Point type`,`Latitude`,`Longitude`,`Geo-reference sources`,`note3`';
  //       rowSQl = 'insert into `Location information` ('+ columns +') values('+args+')';
  //     }
  //     else if (type == 'Disease data') {
  //       columns = '`Location information_LocationID``Species`,`Diagnostic_symptoms`,'+
  //       '`Diagnostic_blood`,`Diagnostic_skin`,`Diagnostic_stool`,`Num_samples`,`Num_specimen`,'+
  //       '`AgeLower`,`AgeUpper`,`Num_examine`,`Num_positive`,`Percent_positive`,`Num_examine_male`,'+
  //       '`Num_positive_male`,`Percent_positive_male`,`Num_examine_female`,`Num_positive_female`,'+
  //       '`Percent_positive_female`,`note4`,`Location information_LocationID1`,`L_ReportID`,'+
  //       '`Location information_Survey description_SurveyID`';
  //       rowSQl = 'insert into `Disease data` ('+ columns +') values('+args+')';
  //     }
  //     else {
  //       columns = '`Group`,`Months after baseline`,`Drug`,`Frequency per year`,`Period (months)`,'+
  //       '`Coverage`,`Other method`,`I_Num_examine`,`I_Num_positive`,`I_Percent_positive`,'+
  //       '`I_Num_examine_male`,`I_Num_positive_male`,`I_Percent_positive_male`,`I_Num_examine_female`,'+
  //       '`I_Num_positive_female`,`I_Percent_positive_female`,`note5`,`Disease data_DiseaseID`,'+
  //       '`Disease data_Location information_LocationID1`,`Disease data_L_ReportID`,'+
  //       '`Disease data_Location information_Survey description_SurveyID`';
  //       rowSQl = 'insert into `Intervention data` ('+ columns +') values('+args+')';
  //     }
  //      var result = sqlConnect.query(rowSQl,function(err,res){
  //        console.log(rowSQl);
  //       if (err) {
  //         console.log(err);
  //           var returnValue = { success: false ,err: err};
  //         }
  //         else {
  //           console.log('success');
  //           var returnValue = { success: true ,err: null};
  //         }
  //      return returnValue;
  //     });
  //   });
  // }
  //  插入参数作为数组传入
  //  args.length should be 16
  // dbOperation.addReport = function(args) {
  //     console.log(args.length);
  //     var columnsStr = '`Reporter`, `Disease`, `Country`, `Document Category`, `Journal`, ' +
  //                   '`Title`, `Authors`, `Year of Pub`, `Volume`, `Issue`, `Page from`, ' +
  //                   '`Page to`, `Author contact needed`, `Open access`, `checked`, `note1`';
  //     var valuesStr = '';
  //     for (var i = 0; i < args.length; ++i) {
  //         valuesStr += args[i];
  //         if (i < args.length - 1)
  //             valuesStr += ', '
  //     }
  //     var insertSQL = 'insert into `Basic sources`(' + columnsStr + ') values('
  //         + valuesStr + ')';
  //     sqlConnect.query(insertSQL, function (err, res) {
  //         if (err) console.log(err);
  //     });
  // }

  return dbOperation;
}
