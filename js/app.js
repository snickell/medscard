if (window.console == undefined) {
    window.console = Object();
}
if (window.console.log == undefined) {
    window.console.log = function (s) { try { console.log(s) } catch (e) { }; };
}

var App = Ember.Application.create();

App.Dosage = Ember.Object.extend({
    time: undefined,
    size: undefined
});

App.Medication = Ember.Object.extend({
    description: "",
    morningDosage: undefined,
    middayDosage: undefined,
    eveningDosage: undefined,
    nightDosage: undefined,
    
    /* Other conditions */
    forceNumerals: false,
    asNeeded: false
});

App.Medication.reopenClass({
   createFromEMRParse: function (emrMed) {
       var med = App.Medication.create({
           description: emrMed.med,
           morningDosage: App.Dosage.create({ time: "morning", size: 0 }),
           middayDosage: App.Dosage.create({ time: "midday", size: 0 }),
           eveningDosage: App.Dosage.create({ time: "evening", size: 0. }),
           nightDosage: App.Dosage.create({ time: "night", size: 0 })
       });
       
       console.log("Working on ", emrMed.med, " with instructions ", emrMed.instructions);
       
       var instructions = emrMed.instructions.toLowerCase();
       console.log("Instructions are: ", instructions)
       var doseSize = 1; // Need to parse this shazzle

       var containsAnyOf = function (s, phrases) {
           var found = false;
           phrases.forEach(function (phrase) {
              found |= s.indexOf(phrase) !== -1;
           });
           return found;
       }
       
       var instructionsContain = function (phrases) {
           return containsAnyOf(instructions, phrases);
       }
       
       var takeInThe = function (time) {
           console.log("Gonna take ", doseSize, " of ", med.get('description'), " in the ", time);
           med.get(time + "Dosage").set("size", doseSize);
       }
       
       // Creamy stuff
       if (instructionsContain(["apply", "cream", "ointment", "lotion", "shampoo", "gel"])) {
           doseSize = 1;
       }

       // Does the doese timing contain a "before meals" style modifier?
       beforeMeals = instructionsContain(["ac", "with meals", "before meals"]);
       beforeMeal = instructionsContain(["ac", "with meal", "before meal", "with dinner", "before dinner"]);

       // Dose timing
       if (instructionsContain(["bid", "twice daily", "twice a day", "two times daily", "two times a day", "q12",  "q12h"])) {
           takeInThe('morning');

           if (beforeMeals) {
               takeInThe('evening');
           } else {
               takeInThe('night');
           }
       } else if (instructionsContain(["qhs", "qpm", "each night", "every night", "each evening", "every evening", "at bedtime"])) {
           if (beforeMeal) {
               takeInThe('evening');
           } else {
               takeInThe('night');
           }
       } else if (instructionsContain(["tid", "q8", "q8h", "three times daily", "three times a day"])) {
           takeInThe('morning');
           takeInThe('midday');

           if (beforeMeals) {
               takeInThe('evening');
           } else {
               takeInThe('night');
           }
       } else if (instructionsContain(["qid", "q6", "q6h", "four times a day", "four times daily"])) {
           takeInThe('morning');
           takeInThe('midday');
           takeInThe('evening');
           takeInThe('night');
       } else if (instructionsContain(["daily", "qam", "each morning", "every morning", "qday", "q24", "qdaily", "q24h", /* confirm with simha: */ "every day"])) {
           // This needs to be last because otherwise 'daily' would match 'twice daily', 'four times daily', etc
           takeInThe('morning');
       }

       if (instructionsContain(["prn", "as needed"])) {
           med.set('asNeeded', true);
       }

       // Should we display as graphics or as numerals?
       if (instructionsContain(["inject"])) {
           med.set('forceNumerals', true);
       } /*else if (medication.dose.size.equalsAnyOf(0, 0.5, 1, 1.5, 2, 2.5, 3, 4)) {
           medication.dose.displayAsGraphicalPills = true;
       } else {
           medication.dose.displayAsGraphicalPills = false;
       }*/
       
       return med;
   }
});

App.Allergy = Ember.Object.extend({
   description: "" 
});

App.Problem = Ember.Object.extend({
   description: "" 
});

App.Problem.reopenClass({
   createFromEMRParse: function (emrProblem) {
       var problem = App.Medication.create({
           description: emrProblem.problem,
       });
       return problem;
   }
});

App.MedCard = Ember.Object.extend({
    description: "Hello world",
    init: function () {
      this.set('allergies', Ember.A(this.get('allergies')));
      this.set('medications', Ember.A(this.get('medications')));
      this.set('problems', Ember.A(this.get('problems')));
      
      /*
      var allergies = this.get('allergies');
      allergies.pushObject(App.Allergy.create({
          description: "Kryptonite"
      }));
      
      var problems = this.get('problems');
      problems.pushObject(App.Problem.create({
          description: "Spandex Chafing"
      }));
      problems.pushObject(App.Problem.create({
          description: "Excessive Moral Fiber"
      }));
      problems.pushObject(App.Problem.create({
          description: "Midwestern Syndrome"
      }));
      
      var medications = this.get('medications');
      medications.pushObject(App.Medication.create({
          description: "Kick in the nuts, 5kg",
          morningDosage: App.Dosage.create({ time: "morning", size: 2 }),
          middayDosage: App.Dosage.create({ time: "midday", size: 0 }),
          eveningDosage: App.Dosage.create({ time: "evening", size: 0.5 }),
          nightDosage: App.Dosage.create({ time: "night", size: 10 })
      }));      
      medications.pushObject(App.Medication.create({
          description: "Depacote 150mg",
          morningDosage: App.Dosage.create({ time: "morning", size: 2 }),
          middayDosage: App.Dosage.create({ time: "midday", size: 1 }),
          eveningDosage: App.Dosage.create({ time: "evening", size: 1 }),
          nightDosage: App.Dosage.create({ time: "night", size: 0.5 })
      }));
      medications.pushObject(App.Medication.create({
          description: "Kneel before Zod",
          morningDosage: App.Dosage.create({ time: "morning", size: 0 }),
          middayDosage: App.Dosage.create({ time: "midday", size: 1 }),
          eveningDosage: App.Dosage.create({ time: "evening", size: 0 }),
          nightDosage: App.Dosage.create({ time: "night", size: 1 })
      }));
      */
    },
    allergies: undefined,
    medications: undefined,
    problems: undefined,
    medicationsLeftColumn: function () {
        return this.get('medications');
    }.property('medications'),
    medicationsRightColumn: function () {
        return [];
    }.property('medications'),
    notes: "",
    parseEMRData: function (emrData) {
        /* First break the file into sections: allergies, problems, meds */
        var regex = /^([\s\S]*)ACTIVE PROBLEMS: ([\s\S]*)Outpatient Medications\s*=====================================================================([\s\S]*)$/;
        var match = regex.exec(emrData);
        var allergies = match[1]
        var problems = match[2];
        var meds = match[3];
        
        /* NOW: cleanup+parse each section: */
        
        /* Allergies */
        allergies = allergies.replace(/[\n\f\r]+/g, " ");
        allergies = allergies.split(", ");
        
        /* Problems */
        // Remove extraneous new-lines
        problems = problems.replace(/[\n\f\r]+/g, "\n");
        // Split based on '##. ' at the start of lines
        problems = problems.split(/\n\d\d?[.] /);
        // Strip new-lines out of individual problems
        problems = problems.map(function (x) { return x.replace("\n", ""); });
        // Remove empty problems
        problems = problems.filter(function (x) { return x.length > 0 });
        // Parse problems
        problems = problems.map(function (problem) {
           var matches = problem.match(/^(.*?)\s*(\*)?\s*(?:\((ICD.+)\))?\s*$/);
           if (matches) {
               return {
                   problem: matches[1],
                   asterisk: matches[2],
                   icd: matches[3]                   
               }
           } else {
               return {
                   problem: matches[1]
               }
           }
        });
        
        /* Medications */
        // Remove extraneous new-lines
        meds = meds.replace(/[\n\f\r]+/g, "\n")
        // Collapse newlines inside a single med: continued lines are detected by leading four spaces
        meds = meds.replace(/\n    /g, " ");
        // Convert to an array
        meds = meds.split("\n");
        // Remove empty meds
        meds = meds.filter(function (x) { return x.length > 0 });
        // Now parse into med name and dosage instructions
        meds = meds.map(function (med) {
            var matches = med.match(/^(.*?)[.]  (.*)$/);
            if (matches) {
                return {
                    med: matches[1],
                    instructions: matches[2]
                }                
            } else {
                return {
                   med: med,
                   instructions: med
                }
            }
        });
        
        return {
            allergies: allergies,
            problems: problems,
            medications: meds
        }
    },
    insertEMRData: function (emrDataString) {
        var emrDate = undefined;
        try {
            emrData = this.parseEMRData(emrDataString);
        } catch (e) {
            alert("The EMR input failed to parse. \n\nTechnical error message was:\n" + e);
            return;
        }
        window.emrData = emrData;
        
        var allergies = this.get('allergies');
        emrData.allergies.forEach(function (allergy) {
           allergies.pushObject(App.Allergy.create({
              description: allergy 
           }));
        });
        
        var medications = this.get('medications');
        emrData.medications.forEach(function (med) {
           medications.pushObject(App.Medication.createFromEMRParse(med)); 
        });

        var problems = this.get('problems');
        emrData.problems.forEach(function (problem) {
           problems.pushObject(App.Problem.createFromEMRParse(problem)); 
        });
    }
});

App.MedCardEditorView = Ember.View.extend({
   content: undefined,
   templateName: "med-card-editor",
   classNames: ["med-card-editor"],
   addNewAllergy: function () {
       this.get('content.allergies').pushObject(App.Allergy.create());
   },
   addNewProblem: function () {
       this.get('content.problems').pushObject(App.Problem.create());
   },
   addNewMedication: function () {
       this.get('content.medications').pushObject(App.Medication.create({
           description: "",
           morningDosage: App.Dosage.create({ time: "morning", size: 0}),
           middayDosage: App.Dosage.create({ time: "midday", size: 0}),
           eveningDosage: App.Dosage.create({ time: "evening", size: 0}),
           nightDosage: App.Dosage.create({ time: "night", size: 0})
       }));
   },
   print: function () {
       window.print();
   },
   emrData: "",
   insertEMRData: function () {
       var emrData = this.get('emrData');
       this.get('content').insertEMRData(emrData);
       this.set('emrData', "");
   }
});

App.MedCardView = Ember.View.extend({
   content: undefined,
   templateName: "med-card",
   classNames: ["med-card"]
});

App.MedicationView = Ember.View.extend({
    content: undefined,
    templateName: "medication",
    tagName: "tr"
});

App.MedicationEditorView = Ember.View.extend({
   content: undefined,
   templateName: "medication-editor",
   classNames: ["medication-editor"],
   tagName: "tr"
});

App.DosageView = Ember.View.extend({
   content: undefined,
   templateName: "dosage",
   classNames: ['dosage'],
   renderAsImg: function () {
       var size = this.get('content.size');
       return size == 0 || size == 0.5 || size == 1 || size == 2;
   }.property('content.size'),
   imgURL: function () {
       return "images/dose-size/" + this.get('content.size') + ".png";
   }.property('content.size')
});

App.DosageEditorView = Ember.View.extend({
   content: undefined,
   templateName: "dosage-editor",
   classNames: ['dosage-editor']
});


App.IndexController = Ember.ObjectController.extend({
    message: "Hello my dears",
    content: null,
    logoutURL: null,
    todaysDate: null,
    init: function () {
        this._super();
        
        this.set('logoutURL', window.logout_url);
        
        var d = new Date();
        var dateString = "" + (d.getMonth()+1) + "/" + d.getDate() + "/" + d.getFullYear();
        this.set('todaysDate', dateString);
    }
});


App.IndexRoute = Ember.Route.extend({
  setupController: function(controller) {
    console.log("Setting content to new MedCard()");
    var medCard = App.MedCard.create();
    window.debugMedCard = medCard;
    controller.set('content', medCard);
  }
});

App.initialize();