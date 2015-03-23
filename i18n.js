'use strict';

var defaultLanguage = 'en_EN';

angular
.module('i18n',['gettext'])
.run(['gettextCatalog', function(gettextCatalog){
    gettextCatalog.setCurrentLanguage('en_EN');
}])
.service('i18nservice', ['gettextCatalog', '$rootScope', function i18n(gettextCatalog, $rootScope) {

    var service = this;

    this.setLocale = function (language) {

        gettextCatalog.setCurrentLanguage(language);
        $rootScope.$emit('locale.change', language);
    };


    function _localize(language) {

        var self = this;

        window._.forIn(self, function (value, key) {

            //se questa chiave inizia con il codice del linguaggio corrente
           if (key.substring(0, language.length) === language) {

                var keyToDest = key.substring(language.length+1);
                self[keyToDest] = value;
            }
        });
    }

    this.localizeModels = function (models) {

        return window._.map(models, this.localizeModel);
    };

    this.localizeModel = function (model) {

        var self = this;

        
        //evito di rilocalizzare modelli che hanno già subito il trattamento
        if (typeof model.localize === 'function') {

            console.warn('This model is already localized');
            return model;
        }


        //vado alla ricerca di eventuali modelli in relazione con questo
        //modello
        window._.forIn(model, function (value, key) {
            
            //relazione a molti
            if (angular.isArray(value)) {
                
                self[key] = service.localizeModels(value);
            }

            //relazione a 1
            else if (angular.isObject(value)) {
                
                self[key] = service.localizeModel(value);
            }
        });


        //attendi evento cambio locale, e se succede cambia stringhe di conseguenza
        $rootScope.$on('locale.change', function (event, locale) {
      
            model.localize(locale);
        });


        //associa la funziona per tradurre le proprietà
        model.localize = _localize;
        model.localize(gettextCatalog.getCurrentLanguage());
        return model;
    };

}]);
