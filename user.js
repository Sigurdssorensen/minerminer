const policies = require('./policies');
const api = require('./api');
const CYCLETIME = 60;

let availableNothingPolicies,
    availableKillPolicies,
    availableInjurePolicies,
    arrayToDeleteFrom,
    usedPolicies = [],
    activePolicies = 1,
    policyDisplayed = false,
    currentPolicyIndex;

let currentCycleTime = 0,
    activeTimer = false;

let allWorkers = [],
    currentWorkers = [],
    currentInjuredWorkers = [],
    currentKilledWorkers = [],
    possibleHires = [];

let equity = 4,
    staticIncome,
    variableIncome;

async function incomeToEquity() {
    let equityArr = [];
    equityArr.push(equity);
    equity += (staticIncome + variableIncome);
    equityArr.push(equity);
    return equityArr;
}

function addWHSEffect(shortTerm, longTerm) {
    staticIncome += longTerm;
    variableIncome += shortTerm;
}

function getRandNum(array) {
    /* Returns a random number between 0 and length of the 'availableNothingPolicies' array. */
    return new Promise(async function(resolve, reject) {
        resolve(Math.floor((Math.random() * array.length)));
    });
}

function getRandomPolicyArrayIndex(params) {
    return new Promise(async function(resolve) {
       resolve(Math.floor((Math.random() * params.length)));
    });
}

function cycleTimer(){
    /* Keeps track of total game time per month. When 'currentCycleTime' is equal to 'CYCLETIME' the timer stops
    */
    currentCycleTime = 0;
    activeTimer = true;

     let timer = setInterval(function(){
        currentCycleTime ++;
        if (currentCycleTime >= CYCLETIME){
            clearInterval(timer);
        }
        else if (currentCycleTime%20 === 0){
            activePolicies ++;
        }
     },1000 );
}

async function currentEmployeeProduction(){
    variableIncome = 0;

    for(let i = 0; i < currentWorkers.length; i++){
        variableIncome += currentWorkers[i].production;
    }

    for(let i = 0; i < currentInjuredWorkers.length; i++){
        variableIncome += currentInjuredWorkers[i].production;
    }
}


module.exports = function() {
    return {
        getRandPolicy : function(canBeKilled, canBeInjured) {
            /* Returns a random policy object from the 'availableNothingPolicies' array.
            */
            return new Promise(async function(resolve, reject) {
                if (availableNothingPolicies !== undefined && availableKillPolicies !== undefined && availableInjurePolicies !== undefined) {
                    // get policy from correct array
                    let params = [availableNothingPolicies];

                    if(canBeKilled) {
                        params.push(availableKillPolicies)
                    }
                    if(canBeInjured) {
                        params.push(availableInjurePolicies);
                    }

                    let index = await getRandomPolicyArrayIndex(params);
                    let array = params[index];
                    arrayToDeleteFrom = array;

                    currentPolicyIndex = await getRandNum(array);
                    resolve(array[currentPolicyIndex]);
                } else {
                    let unParsed = await policies.getPolicies();
                    /*
                    The code snippet (4. JavaScript Deep copy for array and object) below has been adapted from:
                    https://medium.com/@gamshan001/javascript-deep-copy-for-array-and-object-97e3d4bc401a
                    The code snippet appears mostly in its original form, except for changing some variable names.
                    */
                    availableKillPolicies = await JSON.parse(JSON.stringify(unParsed[0]));
                    availableInjurePolicies =  await JSON.parse(JSON.stringify(unParsed[1]));
                    availableNothingPolicies =  await JSON.parse(JSON.stringify(unParsed[2]));

                    /*
                    End code snippet (4. JavaScript Deep copy for array and object)
                    */
                    // get policy from correct array
                    let params = [availableNothingPolicies];

                    if(canBeKilled) {
                        params.push(availableKillPolicies)
                    }
                    if(canBeInjured) {
                        params.push(availableInjurePolicies);
                    }

                    let index = await getRandomPolicyArrayIndex(params);
                    let array = params[index];
                    arrayToDeleteFrom = array;

                    currentPolicyIndex = await getRandNum(array);
                    resolve(array[currentPolicyIndex]);
                }
            });
        },
        getActivePolicies: function() {
            return new Promise(function(resolve, reject) {
                resolve(activePolicies);
            });
        },
        getPolicyDisplayed: function() {
            return new Promise(function(resolve, reject) {
                resolve(policyDisplayed);
            });
        },
        setPolicyDisplayed: function(bool) {
            policyDisplayed = bool;
        },
        setAvailablePolicies : function() {
            availableNothingPolicies = undefined;
            availableInjurePolicies = undefined;
            availableKillPolicies = undefined;
        },
        setActivePolicies: function(){
            activePolicies = 1;
        },
        // REMEMBER TO FIX THIS. THIS DOES NOT TAKE INTO ACCOUNT ALL THREE POLICY ARRAYS
        deleteFromAvailablePolicies: function removePolicy() {
            /* Removes used policies so that they won't appear again, and removes one from 'activePolicies' so that
            it does not display an endless loop of new policies.
            */


            let policyIndex = currentPolicyIndex;
            usedPolicies.push(arrayToDeleteFrom[policyIndex]);
            arrayToDeleteFrom.splice(policyIndex, 1);
            activePolicies --;
        },
        getAllWorkers: function(){
            return allWorkers;
        },
        getCurrentWorkers: function(){
            return currentWorkers;
        },
        getCurrentInjuredWorkers: function(){
            return currentInjuredWorkers;
        },
        getCurrentKilledWorkers: function(){
            return currentKilledWorkers;
        },
        setCurrentEmployeeProduction: function(){
            currentEmployeeProduction();
        },
        getPossibleHires: function(){
            return possibleHires;
        },
        setAllWorkers: async function(){
            allWorkers = await api.getAllWorkers(allWorkers);
        },
        setCurrentWorkers: async function(){
            currentWorkers = await api.getCurrentWorkers(allWorkers, currentWorkers);
        },
        startCycleTimer: function(){
            if (!activeTimer){
                cycleTimer();
            }
        },
        getCurrentCycleTime: function(){
            return currentCycleTime;
        },
        getTotalCycleTime: function(){
            return CYCLETIME;
        },
        setCurrentCycleTime: function() {
            currentCycleTime = 0;
            activeTimer = false;
        },
        setPossibleHires: function(workers){
            possibleHires = workers;
        },
        applyHireCost: function(cost){
            equity -= cost;
        },
        workerProductionReduction: function(cost){
            variableIncome -= cost;
        },
        getAndUpdateEquity: async function() {
            return await incomeToEquity();
        },
        setWHSEffects(shortTerm, longTerm) {
            addWHSEffect(shortTerm, longTerm);
        }
    }
};
