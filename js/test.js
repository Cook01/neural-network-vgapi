function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

let nn = new NeuralNetwork([2, 2, 1]);

let trainingData = [
    {
        input: [0, 0],
        target: [0]
    },
    {
        input: [0, 1],
        target: [1]
    },
    {
        input: [1, 0],
        target: [1]
    },
    {
        input: [1, 1],
        target: [0]
    }
]


for(let i = 0; i < 10000; i++){
    shuffle(trainingData);

    trainingData.forEach(data => {
        nn.train(data.input, data.target);
    })
}

console.table(nn.feedforward([1, 0]));
console.table(nn.feedforward([0, 1]));
console.table(nn.feedforward([1, 1]));
console.table(nn.feedforward([0, 0]));