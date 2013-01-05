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
    useNumerals: false,
    asNeeded: false
});

App.Allergy = Ember.Object.extend({
   description: "" 
});

App.Problem = Ember.Object.extend({
   description: "" 
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
    insertEMRData: function (emrData) {
        var regex = /^([\s\S]*)ACTIVE PROBLEMS: ([\s\S]*)Outpatient Medications\s*=====================================================================([\s\S]*)$/;
        window.emrData = emrData;
        window.daRegex = regex;
        var match = regex.exec(emrData);
        
        var allergies = match[1]
        var problems = match[2];
        var meds = match[3];
        
        // Remove extraneous new-lines
        var meds = meds.replace(/[\n\f\r]+/g, "\n")
        // Collapse newlines inside a single med: continued lines are detected by leading four spaces
        meds = meds.replace(/\n    /g, " ");
        // Convert to an array
        meds = meds.split("\n");
        // Remove empty meds
        meds = meds.filter(function (x) { return x.length > 0 });
        
        meds = meds.map(function (med) {
            var matches = med.match(/(.*?)[.]  (.*)/);
            return {
                med: matches[1],
                description: matches[2]
            } 
        });
        
        window.meds = meds;
        /*
        Aspirin  81 Mg Ec Tab.  Take one tablet by mouth every day to reduce


            risk of heart attack or stroke


        Calcium 250mg/vitamin D 125 Unt Tab.  Take 1 tablet by mouth twice a


            day


        Finasteride 5 Mg Tab.  Take one tablet by mouth every morning before


            breakfast for prostate.  any woman who is or may become pregnant


            should not handle
            */
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

App.ApplicationController = Ember.ObjectController.extend({
    content: undefined,
    init: function () {
        this.set('content', App.MedCard.create());
        window.medCard = this.get('content');
    }
});

App.ApplicationView = Ember.View.extend({
  templateName: 'application'
});

App.Router = Ember.Router.extend({
  root: Ember.Route.extend({
    index: Ember.Route.extend({
      route: '/'
    })
  })
})

App.initialize();