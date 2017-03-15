var express = require('express');
var router = express.Router();

var sqlConnect = require('../models/sqlConnect.js');
var userOperation = require('../models/userOperation.js')(sqlConnect);
var dbOperation = require('../models/dbOperation.js')(sqlConnect);

//  配置主页
router.get('/', function(req, res, next) {
  res.render('home');
});

router.post('/process', function(req, res, next) {
  var user = req.body.username;
  var pass = req.body.password;
  res.status(303);

  //  若已登录，直接跳转
  if (req.session.isonline == true) {
    res.redirect('/home');
    return;
  }
  userOperation.queryUser(user)
    .then(function(rows) {
      for (var i = 0; i < rows.length; ++i) {
        if (rows[i].password === pass) {
          //  success
          req.session.err = null;
          req.session.isonline = true;
          req.session.username = user;
          req.session.password = pass;
          res.redirect('/home');
          return;
        }
      }
      //  登录失败时设置错误信息
      req.session.err = 'username does not exist or wrong password, go back and try again~';
      res.redirect('/');
      // fail
    })
    .catch(function(err) {
      console.log(err);
      res.redirect('/');
    });
});


//  ---------loginReq--------
router.post('/loginReq', function(req, res, next) {
  var user = req.body.username;
  var pass = req.body.password;

  userOperation.queryUser(user)
    .then(function(rows) {
      var returnValue = { success: false, err: null, authority: { write: false, query: false, modity: false, extract: false } };
      if (rows.length > 0) {
        if (rows[0].password === pass) {
          returnValue.success = true;
          var q = rows[0].authority;
          switch (q) {
            case 4:
              returnValue.authority.extract = true;
            case 3:
              returnValue.authority.modity = true;
            case 2:
              returnValue.authority.query = true;
            case 1:
              returnValue.authority.write = true;
              break;
          }
        } else {
          returnValue.err = "用户登录密码错误！！！";
          returnValue.authority = null;
        }
      } else {
        returnValue.err = "用户名错误或用户不存在！！！"
        returnValue.authority = null;
      }
      res.json(returnValue);
    })
    .catch(function(err){
      console.console.log(err);
    });
});
//----------query----------
router.post('/query', function(req, res, next) {
  var id = req.body.id;
  var returnValue = new Array();
  if (id === null || id === '') {
    var disease = req.body.condition.disease;
    var country = req.body.condition.country;
    var year = req.body.condition.year;
    var double_click = req.body.condition.doubleClick;
    dbOperation.queryByDescription(disease, country, year, double_click)
      .then(function(rows) {
        for (var i = 0; i < rows.length; i++) {
          var resjson = {
            ReportID: rows[i].ReportID,
            Reporter: rows[i].Reporter,
            Disease: rows[i].Disease,
            Country: rows[i].Country,
            DocumentCategory: rows[i][`Document Category`],
            Journal: rows[i].Journal,
            Title: rows[i].Title,
            Authors: rows[i].Authors,
            YearOfPub: rows[i][`Year of Pub`],
            Volume: rows[i].Volume,
            Issue: rows[i].Issue,
            PageFrom: rows[i][`Page from`],
            PageTo: rows[i][`Page to`],
            AuthorContactNeeded: rows[i][`Author contact needed`],
            OpenAccess: rows[i][`Open access`],
            Checked: rows[i].checked,
            Note1: rows[i].note1
          };
          returnValue.push(resjson);
        }
        console.log(returnValue);
        res.json({
          result: returnValue,
          err: null
        });
      })
      .catch(function(err) {
        res.json({
          result: null,
          err: err
        })
      })
  }
  if (id != null) {
    dbOperation.queryByReportId(id)
      .then(function(rows) {
        if (rows.length > 0) {
          for (var i = 0; i < rows.length; i++) {
            // console.log(rows[i]);
            var resjson = {
              ReportID: rows[i].ReportID,
              Reporter: rows[i].Reporter,
              Disease: rows[i].Disease,
              Country: rows[i].Country,
              DocumentCategory: rows[i][`Document Category`],
              Journal: rows[i].Journal,
              Title: rows[i].Title,
              Authors: rows[i].Authors,
              YearOfPub: rows[i][`Year of Pub`],
              Volume: rows[i].Volume,
              Issue: rows[i].Issue,
              PageFrom: rows[i][`Page from`],
              PageTo: rows[i][`Page to`],
              AuthorContactNeeded: rows[i][`Author contact needed`],
              OpenAccess: rows[i][`Open access`],
              Checked: rows[i].checked,
              Note1: rows[i].note1
            };
            returnValue.push(resjson);
          }
          //  console.log(returnValue);
          res.json({
            result: returnValue,
            err: null
          });
        }
      })
      .catch(function(err) {
        res.json({
          result: null,
          err: err
        })
      })
  }
});
//----------------------queryTree--------------------------------
router.post("/querynext", function(req, res, next) {
  var types = req.body.type;
  var ID = req.body.id;
  dbOperation.queryTree(types, ID)
    .then(function(rows) {
      var result = new Array();
      if (rows.length > 0) {
        if (types == 'Survey Description') {
          for (var i = 0; i < rows.length; i++) {
            var resjson = {
              SurveyID: rows[i].SurveyID,
              BasicSources_ReportID: rows[i][`Basic sources_ReportID`],
              DataType: rows[i][`Data type`],
              SurveyType: rows[i][`Survey type`],
              MonthStart: rows[i][`Month start`],
              MonthFinish: rows[i][`Month finish`],
              YearStart: rows[i][`Year start`],
              YearFinish: rows[i][`Year finish`],
              Note2: rows[i][`note2`]
            }
            //console.log(resjson);
            result.push(resjson);
          }
          res.json(result);
        } else if (types == 'Location Information') {
          for (var i = 0; i < rows.length; i++) {
            var resjson = {
              LocationID: rows[i][`LocationID`],
              SurveyDescription_BasicSources_ReportID: rows[i][`Survey description_Basic sources_ReportID`],
              SurveyDescription_SurveyID: rows[i][`Survey description_SurveyID`],
              ADM1: rows[i][`ADM1`],
              ADM2: rows[i][`ADM2`],
              ADM3: rows[i][`ADM3`],
              PointName: rows[i][`Point name`],
              PointType: rows[i][`Point type`],
              Latitude: rows[i][`Latitude`],
              Longitude: rows[i][`Longitude`],
              GeoReferenceSources: rows[i][`Geo-reference sources`],
              Note3: rows[i][`note3`]
            }
            //console.log(resjson);
            result.push(resjson);
          }
          res.json(result);
        } else if (types == 'Disease Data') {
          for (var i = 0; i < rows.length; i++) {
            var resjson = {
              DiseaseID: rows[i][`DiseaseID`],
              LocationInformationLocationID: rows[i][`Location information_LocationID`],
              Species: rows[i][`Species`],
              DiagnosticSymptoms: rows[i][`Diagnostic_symptoms`],
              DiagnosticBlood: rows[i][`Diagnostic_blood`],
              DiagnosticSkin: rows[i][`Diagnostic_skin`],
              DiagnosticStool: rows[i][`Diagnostic_stool`],
              NumSamples: rows[i][`Num_samples`],
              NumSpecimen: rows[i][`Num_specimen`],
              AgeLower: rows[i][`AgeLower`],
              AgeUpper: rows[i][`AgeUpper`],
              NumExamine: rows[i][`Num_examine`],
              NumPositive: rows[i][`Num_positive`],
              PercentPositive: rows[i][`Percent_positive`],
              NumExamineMale: rows[i][`Num_examine_male`],
              NumPositiveMale: rows[i][`Num_positive_male`],
              PercentPositiveMale: rows[i][`Percent_positive_male`],
              NumExamineFemale: rows[i][`Num_examine_female`],
              NumPositiveFemale: rows[i][`Num_positive_female`],
              PercentPositiveFemale: rows[i][`Percent_positive_female`],
              Note4: rows[i][`note4`],
              LocationInformationLocationID1: rows[i][`Location information_LocationID1`],
              LReportID: rows[i][`L_ReportID`],
              LocationInformationSurveyDescriptionSurveyID: rows[i][`Location information_Survey description_SurveyID`]
            }
            //  console.log(resjson);
            result.push(resjson);
          }
          res.json(result);
        } else {
          for (var i = 0; i < rows.length; i++) {
            var resjson = {
              InterventionID: rows[i][`InterventionID`],
              Group: rows[i][`Group`],
              MonthsAfterBaseline: rows[i][`Months after baseline`],
              Drug: rows[i][`Drug`],
              FrequencyPerYear: rows[i][`Frequency per year`],
              PeriodMonths: rows[i][`Period (months)`],
              Coverage: rows[i][`Coverage`],
              OtherMethod: rows[i][`Other method`],
              INumExamine: rows[i][`I_Num_examine`],
              INumPositive: rows[i][`I_Num_positive`],
              IPercentPositive: rows[i][`I_Percent_positive`],
              INumExamineMale: rows[i][`I_Num_examine_male`],
              INumPositiveMale: rows[i][`I_Num_positive_male`],
              IPercentPositiveMale: rows[i][`I_Percent_positive_male`],
              INumExamineFemale: rows[i][`I_Num_examine_female`],
              INumPositiveFemale: rows[i][`I_Num_positive_female`],
              IPercentPositiveFemale: rows[i][`I_Percent_positive_female`],
              Note5: rows[i][`note5`],
              DiseaseDataDiseaseID: rows[i][`Disease data_DiseaseID`],
              DiseaseDataLocationInformationLocationID1: rows[i][`Disease data_Location information_LocationID1`],
              DiseaseDataLReportID: rows[i][`Disease data_L_ReportID`],
              DiseaseDataLocationInformationSurveyDescriptionSurveyID: rows[i][`Disease data_Location information_Survey description_SurveyID`]
            }
            result.push(resjson);
          }
          res.json(result);
        }
      } else {
        res.json(result);
      }
    })
    .catch((err) => {
      console.log(err)
    })
});

router.post('/getidcontent', function(req, res, next) {
  var type = req.body.type;
  var id = req.body.id;
  dbOperation.getIdContent(id, type)
    .then((rows) => {
      if (rows.length == 0) {
        res.json({
          data: null,
          err: null
        })
        return
      }
      switch (type) {
        case 'Basic Sources':
          res.json({
            data: {
              ReportID: rows[0]['ReportID'],  //  自动生成的随机值，从数据库获取
              Reporter: rows[0]['Reporter'],
              Disease: rows[0]['Disease'],
              Country: rows[0]['Country'],
              DocumentCategory: rows[0]['Document Category'],
              Journal: rows[0]['Journal'],
              Title: rows[0]['Title'],
              Authors: rows[0]['Authors'],
              YearOfPub: rows[0]['Year of Pub'],
              Volume: rows[0]['Volume'],
              Issue: rows[0]['Issue'],
              PageFrom: rows[0]['Page from'],
              PageTo: rows[0]['Page to'],
              AuthorContactNeeded: rows[0]['Author contact needed'],
              OpenAccess: rows[0]['Open access'],
              Checked: rows[0]['checked'],
              Note1: rows[0]['note1']  //  note1
            },
            err: null
          })
          break
        case 'Survey Description':
          res.json({
            data: {
              SurveyID: rows[0]['SurveyID'],
              BasicSourcesReportID: rows[0]['Basic sources_ReportID'],
              DataType: rows[0]['Data type'],
              SurveyType: rows[0]['Survey type'],
              MonthStart: rows[0]['Month start'],
              MonthFinish: rows[0]['Month finish'],
              YearStart: rows[0]['Year start'],
              YearFinish: rows[0]['Year finish'],
              Note2: rows[0]['note2']
            },
            err: null
          })
          break
        case 'Location Information':
          console.log(rows[0])
          res.json({
            data: {
              LocationID: rows[0]['LocationID'],
              SurveyDescriptionBasicSourcesReportID: rows[0]['Survey description_Basic sources_ReportID'],
              SurveyDescriptionSurveyID: rows[0]['Survey description_SurveyID'],
              ADM1: rows[0]['ADM1'],
              ADM2: rows[0]['ADM2'],
              ADM3: rows[0]['ADM3'],
              PointName: rows[0]['Point name'],
              PointType: rows[0]['Point type'],
              Latitude: rows[0]['Latitude'],
              Longitude: rows[0]['Longitude'],
              GeoReferenceSources: rows[0]['Geo-reference sources'],
              Note3: rows[0]['note3']
            },
            err: null
          })
          break
        case 'Disease Data':
          res.json({
            data: {
              DiseaseID: rows[0]['DiseaseID'],
              LocationInformationLocationID: rows[0]['Location information_LocationID'],
              Species: rows[0]['Species'],
              DiagnosticSymptoms: rows[0]['Diagnostic_symptoms'],
              DiagnosticBlood: rows[0]['Diagnostic_blood'],
              DiagnosticSkin: rows[0]['Diagnostic_skin'],
              DiagnosticStool: rows[0]['Diagnostic_stool'],
              NumSamples: rows[0]['Num_samples'],
              NumSpecimen: rows[0]['Num_specimen'],
              AgeLower: rows[0]['AgeLower'],
              AgeUpper: rows[0]['AgeUpper'],
              NumExamine: rows[0]['Num_examine'],
              NumPositive: rows[0]['Num_positive'],
              PercentPositive: rows[0]['Percent_positive'],
              NumExamineMale: rows[0]['Num_examine_male'],
              NumPositiveMale: rows[0]['Num_positive_male'],
              PercentPositiveMale: rows[0]['Percent_positive_male'],
              NumExamineFemale: rows[0]['Num_examine_female'],
              NumPositiveFemale: rows[0]['Num_positive_female'],
              PercentPositiveFemale: rows[0]['Percent_positive_female'],
              Note4: rows[0]['note4'],
              LocationInformationLocationID1: rows[0]['Location information_LocationID1'],
              LReportID: rows[0]['L_ReportID'],
              LocationInformationSurveyDescriptionSurveyID: rows[0]['Location information_Survey description_SurveyID']
            },
            err: null
          })
          break
        case 'Intervention Data':
          res.json({
            data: {
              InterventionID: rows[0]['InterventionID'],
              Group: rows[0]['Group'],
              MonthsAfterBaseline: rows[0]['Months after baseline'],
              Drug: rows[0]['Drug'],
              FrequencyPerYear: rows[0]['Frequency per year'],
              PeriodMonths: rows[0]['Period (months)'],
              Coverage: rows[0]['Coverage'],
              OtherMethod: rows[0]['Other method'],
              INumExamine: rows[0]['I_Num_examine'],
              INumPositive: rows[0]['I_Num_positive'],
              IPercentPositive: rows[0]['I_Percent_positive'],
              INumExamineMale: rows[0]['I_Num_examine_male'],
              INumPositiveMale: rows[0]['I_Num_positive_male'],
              IPercentPositiveMale: rows[0]['I_Percent_positive_male'],
              INumExamineFemale: rows[0]['I_Num_examine_female'],
              INumPositiveFemale: rows[0]['I_Num_positive_female'],
              IPercentPositiveFemale: rows[0]['I_Percent_positive_female'],
              Note5: rows[0]['note5'],
              DiseaseDataDiseaseID: rows[0]['Disease data_DiseaseID'],
              DiseaseDataLocationInformationLocationID1: rows[0]['Disease data_Location information_LocationID1'],
              DiseaseDataLReportID: rows[0]['Disease data_L_ReportID'],
              DiseaseDataLocationInformationSurveyDescriptionSurveyID: rows[0]['Disease data_Location information_Survey description_SurveyID']
            },
            err: null
          })
          break
        default:
        res.json({
          data: null,
          err: 'type error'
        })
      }
      res.json({
        data: rows[0],
        err:null
      })
    })
    .catch((err) => {
      res.json({
        data: null,
        err: err
      })
    })
})

//-------增添操作----add---------------
router.post("/add", function(req, res, next) {
  var types = req.body.type;
  console.log(types);
  var id = null;
  var valuesStr = '';
  if (types != 'Basic Sources') {
    if (types == 'Survey Description') {
      id = req.body.data.BasicSourcesReportID;
      valuesStr = [req.body.data.SurveyID, req.body.data.BasicSourcesReportID, req.body.data.DataType,
        req.body.data.SurveyType, req.body.data.MonthStart, req.body.data.MonthFinish, req.body.data.YearStart,
        req.body.data.YearFinish, req.body.data.Note2
      ];
    } else if (types == 'Location Information') {
      id = req.body.data.SurveyDescriptionSurveyID;
      valuesStr = [req.body.data.LocationID, req.body.data.SurveyDescriptionBasicSourcesReportID,
        req.body.data.SurveyDescriptionSurveyID, req.body.data.ADM1, req.body.data.ADM2,
        req.body.data.ADM3, req.body.data.PointName, req.body.data.PointType, req.body.data.Latitude,
        req.body.data.Longitude, req.body.data.GeoReferenceSources, req.body.data.Note3
      ];
    } else if (types == 'Disease Data') {
      id = req.body.data.LocationInformationLocationID;
      valuesStr = [req.body.data.DiseaseID, req.body.data.LocationInformationLocationID,
        req.body.data.Species, req.body.data.DiagnosticSymptoms, req.body.data.DiagnosticBlood,
        req.body.data.DiagnosticSkin, req.body.data.DiagnosticStool, req.body.data.NumSamples,
        req.body.data.NumSpecimen, req.body.data.AgeLower, req.body.data.AgeUpper,
        req.body.data.NumExamine, req.body.data.NumPositive, req.body.data.PercentPositive,
        req.body.data.NumExamineMale, req.body.data.NumPositiveMale, req.body.data.PercentPositiveMale,
        req.body.data.NumExamineFemale, req.body.data.NumPositiveFemale, req.body.data.PercentPositiveFemale,
        req.body.data.Note4, req.body.data.LocationInformationLocationID1, req.body.data.LReportID,
        req.body.data.LocationInformationSurveyDescriptionSurveyID
      ];
    } else if (types == 'Intervention Data') {
      id = req.body.data.DiseaseDataDiseaseID;
      valuesStr = [req.body.data.InterventionID, req.body.data.Group, req.body.data.MonthsAfterBaseline,
        req.body.data.Drug, req.body.data.FrequencyPerYear, req.body.data.PeriodMonths, req.body.data.Coverage,
        req.body.data.OtherMethod, req.body.data.INumExamine, req.body.data.INumPositive, req.body.data.IPercentPositive,
        req.body.data.INumExamineMale, req.body.data.INumPositiveMale, req.body.data.IPercentPositiveMale,
        req.body.data.INumExamineFemale, req.body.data.INumPositiveFemale, req.body.data.IPercentPositiveFemale,
        req.body.data.Note5, req.body.data.DiseaseDataDiseaseID, req.body.data.DiseaseDataLocationInformationLocationID1,
        req.body.data.DiseaseDataLReportID, req.body.data.DiseaseDataLocationInformationSurveyDescriptionSurveyID
      ];
    }
    var rowLength = dbOperation.check(types, id)
      .then(function(rows) {
        return rows.length;
      })
      .catch((err) => {
        console.log(err)
      });
    if (!(rowLength > 0)) {
      // console.log(req.body.data);
      // console.log(valuesStr);
      var insertResult = dbOperation.add(valuesStr, types)
        .then(function(rows) {
          if (rows) {
            var returnValue = { success: true, err: null };
          } else {
            var returnValue = { success: false, err: '插入失败！！！' };
          }
          console.log(returnValue);
          return res.json(returnValue);
        })
        .catch(function(err) {
          returnValue = { success: false, err: err };
          console.log(returnValue);
          res.json(returnValue);
        });
    }
  } else if (types == 'Basic Sources') {
    valuesStr = [req.body.data.ReportID, req.body.data.Reporter, req.body.data.Disease,
      req.body.data.Country, req.body.data.DocumentCategory, req.body.data.Journal,
      req.body.data.Title, req.body.data.Authors, req.body.data.YearOfPub, req.body.data.Volume,
      req.body.data.Issue, req.body.data.PageFrom, req.body.data.PageTo, req.body.data.AuthorContactNeeded,
      req.body.data.OpenAccess, req.body.data.Checked, req.body.data.Note1
    ];
    console.log(valuesStr);
    var insertResult = dbOperation.add(valuesStr, types)
      .then(function(rows) {
        if (rows) {
          var returnValue = { success: true, err: null };
        } else {
          var returnValue = { success: false, err: '插入失败！！！' };
        }
        console.log(returnValue);
        res.json(returnValue);
      })
      .catch(function(err) {
        returnValue = { success: false, err: err };
        console.log(returnValue);
        res.json(returnValue);
      });
  }
});

//----------------删除操作--------------------------
router.post("/delete", function(req, res, next) {
  var type = req.body.type;
  var id = req.body.ID;
  dbOperation.delete(type, id)
    .then(function(rows) {
      //console.log(rows);
      if (rows) {
        var returnValue = { success: true, err: null };
      } else {
        var returnValue = { success: false, err: '删除失败！！！' };
      }
      //console.log(id);
      //console.log(returnValue);
      res.json(returnValue);
    })
    .catch((err) => {
      console.log(err)
    })

});

//----------------编辑操作--------------------------
router.post("/edit", function(req, res, next) {
  var types = req.body.type;
  console.log(types);
  console.log(req.body.data);
  var id = null;
  if (types == 'Basic Sources') {
    id = req.body.data.ReportID;
    var sql = 'update `basic sources` set ' +
      '`Reporter` = \'' + req.body.data.Reporter +
      '\',`Disease`= \'' + req.body.data.Disease +
      '\',`Country`= \'' + req.body.data.Country +
      '\',`Document Category`= \'' + req.body.data.DocumentCategory +
      '\',`Journal` = \'' + req.body.data.Journal +
      '\',`Title` = \'' + req.body.data.Title +
      '\',`Authors`= \'' + req.body.data.Authors +
      '\',`Year of Pub`=' + req.body.data.YearOfPub +
      ',`Volume`=' + req.body.data.Volume +
      ',`Issue`=' + req.body.data.Issue +
      ',`Page from`=' + req.body.data.PageFrom +
      ',`Page to`=' + req.body.data.PageTo +
      ',`Author contact needed`= \'' + req.body.data.AuthorContactNeeded +
      '\',`Open access`= \'' + req.body.data.OpenAccess +
      '\',`checked`= \'' + req.body.data.Checked +
      '\',`note1`= \'' + req.body.data.Note1 + '\' where ReportID =' + id;
  } else if (types == 'Survey Description') {
    id = req.body.data.SurveyID;
    var sql = 'update `' + types + '` set ' + '`Basic sources_ReportID`= ' +
      req.body.data.BasicSourcesReportID +
      ',`Data type`= \'' + req.body.data.DataType +
      '\',`Survey type`= \'' + req.body.data.SurveyType +
      '\',`Month start`= \'' + req.body.data.MonthStart +
      '\',`Month finish`= \'' + req.body.data.MonthFinish +
      '\',`Year start`= ' + req.body.data.YearStart +
      ',`Year finish`= ' + req.body.data.YearFinish +
      ',`note2`= \'' + req.body.data.Note2 + '\' where SurveyID = ' + id;
  } else if (types == 'Location Information') {
    id = req.body.data.LocationID;
    var sql = 'update `' + types + '` set ' +
      '`Survey description_Basic sources_ReportID`= ' + req.body.data.SurveyDescriptionBasicSourcesReportID +
      ',`Survey description_SurveyID`= ' + req.body.data.SurveyDescriptionSurveyID +
      ',`ADM1`= \'' + req.body.data.ADM1 +
      '\',`ADM2`= \'' + req.body.data.ADM2 +
      '\',`ADM3`= \'' + req.body.data.ADM3 +
      '\',`Point name`= \'' + req.body.data.PointName +
      '\',`Point type`= \'' + req.body.data.PointType +
      '\',`Latitude`= ' + req.body.data.Latitude +
      ',`Longitude`= ' + req.body.data.Longitude +
      ',`Geo-reference sources`= \'' + req.body.data.GeoReferenceSources +
      '\',`note3`= \'' + req.body.data.Note3 + '\' where LocationID = ' + id;
  } else if (types == 'Disease Data') {
    id = req.body.data.DiseaseID;
    var sql = 'update `' + types + '` set ' +
      '`Location information_LocationID`= \'' + req.body.data.LocationInformationLocationID +
      '\',`Species`= \'' + req.body.data.Species +
      '\',`Diagnostic_symptoms`= \'' + req.body.data.DiagnosticSymptoms +
      '\',`Diagnostic_blood`= \'' + req.body.data.DiagnosticBlood +
      '\',`Diagnostic_skin`= \'' + req.body.data.DiagnosticSkin +
      '\',`Diagnostic_stool`= \'' + req.body.data.DiagnosticStool +
      '\',`Num_samples`= \'' + req.body.data.NumSamples +
      '\',`Num_specimen`= \'' + req.body.data.NumSpecimen +
      '\',`AgeLower`= ' + req.body.data.AgeLower +
      ',`AgeUpper`= ' + req.body.data.AgeUpper +
      ',`Num_examine`= ' + req.body.data.NumExamine +
      ',`Num_positive`= ' + req.body.data.NumPositive +
      ',`Percent_positive`= ' + req.body.data.PercentPositive +
      ',`Num_examine_male`= ' + req.body.data.NumExamineMale +
      ',`Num_positive_male`= ' + req.body.data.NumPositiveMale +
      ',`Percent_positive_male`= ' + req.body.data.PercentPositiveMale +
      ',`Num_examine_female`= ' + req.body.data.NumExamineFemale +
      ',`Num_positive_female`= ' + req.body.data.NumPositiveFemale +
      ',`Percent_positive_female`= ' + req.body.data.PercentPositiveFemale +
      ',`note4`= \'' + req.body.data.Note4 +
      '\',`Location information_LocationID1`= ' + req.body.data.LocationInformationLocationID1 +
      ',`L_ReportID`= ' + req.body.data.LReportID +
      ',`Location information_Survey description_SurveyID`= ' + req.body.data.LocationInformationSurveyDescriptionSurveyID +
      ' where DiseaseID = ' + id;
  } else if (types == 'Intervention Data') {
    id = req.body.data.InterventionID;
    var sql = 'update `Intervention data` set ' +
      '`Group`= \'' + req.body.data.Group +
      '\',`Months after baseline`= ' + req.body.data.MonthsAfterBaseline +
      ',`Drug`= \'' + req.body.data.Drug +
      '\',`Frequency per year`= ' + req.body.data.FrequencyPerYear +
      ',`Period (months)`= ' + req.body.data.PeriodMonths +
      ',`Coverage`= ' + req.body.data.Coverage +
      ',`Other method`= \'' + req.body.data.OtherMethod +
      '\',`I_Num_examine`= ' + req.body.data.INumExamine +
      ',`I_Num_positive`= ' + req.body.data.INumPositive +
      ',`I_Percent_positive`= ' + req.body.data.IPercentPositive +
      ',`I_Num_examine_male`= ' + req.body.data.INumExamineMale +
      ',`I_Num_positive_male`= ' + req.body.data.INumPositiveMale +
      ',`I_Percent_positive_male`= ' + req.body.data.IPercentPositiveMale +
      ',`I_Num_examine_female`= ' + req.body.data.INumExamineFemale +
      ',`I_Num_positive_female`= ' + req.body.data.INumPositiveFemale +
      ',`I_Percent_positive_female`= ' + req.body.data.IPercentPositiveFemale +
      ',`note5`= \'' + req.body.data.Note5 +
      '\',`Disease data_DiseaseID`= ' + req.body.data.DiseaseDataDiseaseID +
      ',`Disease data_Location information_LocationID1`= ' + req.body.data.DiseaseDataLocationInformationLocationID1 +
      ',`Disease data_L_ReportID`= ' + req.body.data.DiseaseDataLReportID +
      ',`Disease data_Location information_Survey description_SurveyID`= ' + req.body.data.DiseaseDataLocationInformationSurveyDescriptionSurveyID +
      ' where InterventionID = ' + id;
  } else {
    console.log('err >> not match')
  }
  var response = { success: true, err: null };
  console.log(sql);
  sqlConnect.query(sql, function(err, result) {
    if (err) {
      console.log(err);
      response = { success: false, err: err };
    }
    res.json(response);
  });
});

router.post('/getid', function(req, res, next) {
  var type = req.body.type;
  dbOperation.getMaxID(type)
    .then(function(rows) {
      if (rows) {
        num = rows[0].ID + 1;
      } else {
        id = 1;
      }
      var returnValue = { id: num };
      console.log(returnValue);
      res.json(returnValue);
    })
    .catch((err) => {
      console.log(err)
      res.json({
        id: -1,
        err: err
      })
    })
});

router.post('/getidtree', function(req, res, next) {
  dbOperation.getIDTree(req.body.id)
    .then(([rowS, rowL, rowD, rowI]) => {
      //  build an id tree
      //  暂时使用遍历的算法，复杂度待优化
      var rootID = req.body.id
      var idTree = {}
      idTree[rootID] = {}
      // console.log('>> S: ')
      for (let i in rowS) {
        idTree[rootID][rowS[i].SurveyID] = {}
        // console.log(rowS[i].SurveyID)
      }
      // console.log('>> L: ')
      for (let i in rowL) {
        let sid = rowL[i]['Survey description_SurveyID']
        let lid = rowL[i]['LocationID']
        idTree[rootID][sid][lid] = {}
        // console.log([sid, lid])
      }
      // console.log('>> D: ')
      for (let i in rowD) {
        let sid = rowD[i]['Location information_Survey description_SurveyID']
        let lid = rowD[i]['Location information_LocationID1']
        let did = rowD[i]['DiseaseID']
        idTree[rootID][sid][lid][did] = {}
        // console.log([sid, lid, did])
      }
      // console.log('>> I: ')
      for (let i in rowI) {
        let sid = rowI[i]['Disease data_Location information_Survey description_SurveyID']
        let lid = rowI[i]['Disease data_Location information_LocationID1']
        let did = rowI[i]['Disease data_DiseaseID']
        let iid = rowI[i]['InterventionID']
        idTree[rootID][sid][lid][did][iid] = {}
        // console.log([sid, lid, did, iid])
      }
      // console.log(idTree)
      res.json({
        data: idTree,
        err: null
      })
    })
    .catch((reasons) => {
      console.log(reasons)
      res.json({
        data: null,
        err: reasons
      })
    })
})

module.exports = router;
