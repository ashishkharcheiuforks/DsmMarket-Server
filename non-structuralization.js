var candyMachine = {
    status: {
        name: 'node',
        count: '5',
    },
    getCandy: function() {
        this.status.count--;
        return this.status.count;
    }
};
var getCandy = candyMachine.getCandy;
var count = candyMachine.status.count;
console.log(getCandy)
console.log(count)

const candyMachine2 = {
    status2 : {
        name2: 'node',
        count2: 5,
    },
    getCandy2: function() {
        this.status2.count2--;
        return this.status2.count2;
    }
};

const { getCandy2, status2: { count2 } } = candyMachine2;
console.log({getCandy2, status2:{count2}})