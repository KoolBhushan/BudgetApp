// BUDGET CONTROLLER - IIFE

var budgetController = (function () {

    var Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    // Add a method to the constructor to calculate percentage
    Expense.prototype.calcPercentage = function (totalIncome) {

        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
    };

    // Add a method to the constructor to get the percentage
    Expense.prototype.getPercentage = function () {
        return this.percentage;
    };

    var Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };


    var data = {

        allItems: {
            exp: [],
            inc: []
        },

        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    };


    var calculateTotal = function (type) {
        var sum = 0;

        data.allItems[type].forEach(element => {
            sum += element.value;
        });

        data.totals[type] = sum;
    };

    // Object containing public data 
    return {
        addItems: function (type, desc, val) {
            var newItem, ID;

            // Create new ID
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }

            // Create new Item based on income and expense
            if (type === 'exp') {
                newItem = new Expense(ID, desc, val);
            } else if (type === 'inc') {
                newItem = new Income(ID, desc, val);
            }

            // Push it into the data structure
            data.allItems[type].push(newItem);

            // Return the newly created item
            return newItem;
        },


        deleteItem: function (type, id) {
            var ids, index;

            // Find the index of the id

            ids = data.allItems[type].map(element => {
                return element.id;
            });

            index = ids.indexOf(id); //Returns -1 if the value is not found

            if (index !== -1) {
                data.allItems[type].splice(index, 1); // Deletes 1 item with index = index
            }
        },

        calculateBudget: function () {

            // Calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');

            // Calculate the budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp;

            if (data.totals.inc > 0) {
                // Calculate the percentage of income that we spent
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }
        },

        calculatePercentages: function () {
            data.allItems.exp.forEach(element => {
                element.calcPercentage(data.totals.inc);
            });
        },

        getPercentages: function () {
            var allPerc = data.allItems.exp.map(element => {
                return element.getPercentage();
            });

            return allPerc;
        },

        getBudget: function () {
            return {
                budget: data.budget,
                totalIncome: data.totals.inc,
                totalExpenses: data.totals.exp,
                percentage: data.percentage
            }
        },

        testing: function () {
            console.log(data);
        }
    };


})();


// UI CONTROLLER
var uiController = (function () {
    var DOMStrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        expenseContainer: '.expenses__list',
        incomeContainer: '.income__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expenseLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPecentageLabel: '.item__percentage',
        dateLabel: '.budget__title--month'

    }

    var formatNumber = function (num, typ) {
        /*
            + or - before the number based on the type
            exactly two decimal places
            comma seperating the thousands
        */
        var numSplit, int, dec, sign;
        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');

        int = numSplit[0];

        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
        }

        typ === 'exp' ? sign = '-' : sign = '+';

        dec = numSplit[1];

        return sign + ' ' + int + '.' + dec;
    };

    return {
        getInput: function () {
            return {
                type: document.querySelector(DOMStrings.inputType).value, // will be inc or exp
                description: document.querySelector(DOMStrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMStrings.inputValue).value)
            }
        },

        addListItem: function (obj, type) {
            var html, newHtml, element;
            if (type == 'inc') {

                // Create HTML string with placeholder text for INCOME
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';

                element = DOMStrings.incomeContainer;
            } else {

                // Create HTML string with placeholder text for EXPENSE
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';

                element = DOMStrings.expenseContainer;
            }

            // Replace the placeholder data with the actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));


            // Insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },

        deleteListItem: function (selectorId) {
            // Get the parent node for the selected element
            var el = document.getElementById(selectorId).parentNode;

            // Remove the selected child element from the parent
            el.removeChild(document.getElementById(selectorId));

        },

        clearFileds: function () {

            var fields, fieldsArray;
            fields = document.querySelectorAll(DOMStrings.inputDescription + ',' + DOMStrings.inputValue); //Returns a list

            // passing the list to the slice method so it gives us an array
            fieldsArray = Array.prototype.slice.call(fields);

            fieldsArray.forEach(function (curr, id, arr) {
                curr.value = "";
            });

            fieldsArray[0].focus();
        },

        displayBudget: function (obj) {

            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';

            document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMStrings.incomeLabel).textContent = formatNumber(obj.totalIncome, 'inc');
            document.querySelector(DOMStrings.expenseLabel).textContent = formatNumber(obj.totalExpenses, 'exp');

            if (obj.percentage > 0) {
                document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMStrings.percentageLabel).textContent = '---';
            }
        },


        displayMonth: function() {
            var now = new Date();
            var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            var month = now.getMonth();
            var year = now.getFullYear();

            document.querySelector(DOMStrings.dateLabel).textContent = months[month] + ' ' + year;
        },

        displayPercentage: function (percentArray) {

            var fields = document.querySelectorAll(DOMStrings.expensesPecentageLabel); // Returns a node list

            var nodeListForEach = function (list, callback) {
                for (let index = 0; index < list.length; index++) {
                    callback(list[index], index);
                }
            };

            nodeListForEach(fields, function (current, index) {

                if (percentArray[index] > 0) {
                    current.textContent = percentArray[index] + '%';
                } else {
                    current.textContent = '---';
                }
            });
        },

        getDOMStrings: function () {
            return DOMStrings;
        }
    };

})();


// APP CONTROLLER
var appController = (function (budgetCtrl, uiCtrl) {

    var DOM = uiCtrl.getDOMStrings();

    var setupEventListeners = function () {

        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function (event) {

            if (event.keycode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
    };

    var updateBudget = function () {

        // 1. Calculate the budget
        budgetCtrl.calculateBudget();

        // 2. Return the budget
        var budget = budgetCtrl.getBudget();

        // 3. Display the budget
        uiCtrl.displayBudget(budget);
    };

    var updatePercentage = function () {

        // 1. Calculate the percentages
        budgetCtrl.calculatePercentages();

        // 2. Read percentage from the budget controller
        var perc = budgetCtrl.getPercentages();

        // 3 Update the UI with new percentages
        uiCtrl.displayPercentage(perc);
    };

    var ctrlAddItem = function () {

        var inputObj, newItem;
        // 1. Get the field input data 
        inputObj = uiCtrl.getInput();

        if (inputObj.description !== "" && !isNaN(inputObj.value) && inputObj.value > 0) {

            // 2. Add the item to the budget controller   
            newItem = budgetCtrl.addItems(inputObj.type, inputObj.description, inputObj.value);
            //budgetCtrl.testing();

            // 3. Add the item to the UI
            uiCtrl.addListItem(newItem, inputObj.type);

            // 4. clear the inputs
            uiCtrl.clearFileds();

            // 5. Calculate and update budget
            updateBudget();

            // 6. Calculate and update the percentages
            updatePercentage();
        }
    };

    var ctrlDeleteItem = function (event) {
        var itemId, splitId, type, ID;
        itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if (itemId) {

            // Get the Id and type from the button pressed
            splitId = itemId.split('-');
            type = splitId[0];
            ID = parseFloat(splitId[1]);

            // 1. Delete the item from data structure.
            budgetCtrl.deleteItem(type, ID);

            // 2. Delete the row from UI whose delete button was pressed.
            uiCtrl.deleteListItem(itemId);

            // 3. Update and show the new budget.
            updateBudget();

            // 4. Calculate and update the percentages
            updatePercentage();
        }
    };


    return {
        init: function () {
            console.log('Application has started...');
            uiCtrl.displayMonth();
            // 3. Display the budget as zero
            uiCtrl.displayBudget({
                budget: 0,
                totalIncome: 0,
                totalExpenses: 0,
                percentage: 0
            });

            setupEventListeners();
        }
    };

})(budgetController, uiController);


appController.init();
