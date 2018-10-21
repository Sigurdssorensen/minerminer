const policies = require('./policies');
const api = require('./api');
const CYCLETIME = 60;

let availableNothingPolicies;
let availableKillPolicies;
let availableInjurePolicies;
let usedPolicies = [];
let activePolicies = 1;
let policyDisplayed = false;
let currentPolicyIndex;

let currentCycleTime = 0;
let activeTimer = false;

let allWorkers = [];
let currentWorkers = [];
let currentInjuredWorkers = [];
let currentKilledWorkers = [];
let possibleHires = [];


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
                        console.log(canBeKilled);
                        params.push(availableKillPolicies)
                    }
                    if(canBeInjured) {
                        console.log(canBeInjured);
                        params.push(availableInjurePolicies);
                    }

                    let index = await getRandomPolicyArrayIndex(params);
                    let array = params[index];

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
                        console.log(canBeKilled);
                        params.push(availableKillPolicies)
                    }
                    if(canBeInjured) {
                        console.log(canBeInjured);
                        params.push(availableInjurePolicies);
                    }

                    let index = await getRandomPolicyArrayIndex(params);
                    let array = params[index];

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
        },
        setActivePolicies: function(){
            activePolicies = 1;
        },
        deleteFromAvailablePolicies: function removePolicy() {
            /* Removes used policies so that they won't appear again, and removes one from 'activePolicies' so that
            it does not display an endless loop of new policies.
            */
            let policyIndex = currentPolicyIndex;
            usedPolicies.push(availableNothingPolicies[policyIndex]);
            availableNothingPolicies.splice(policyIndex, 1);
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
        }
    }
};
