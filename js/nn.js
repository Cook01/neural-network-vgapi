function sigmoid(x){
    return (1/(1 + Math.exp(-x)));
}

function dsigmoid(y){
    return y * (1 - y);
}

/* Does not work (yet)
function ReLU(x){
    if(x <= 0)
        return 0;
    else
        return x;
}

function dReLU(y){
    if(y <= 0)
        return 0;
    else
        return 1;
}
*/

class NeuralNetwork {
    constructor(nbInput, nbHidden, nbOutput) {
        // Initiate the Architecture
        this.inputNodes = nbInput;
        this.hiddenNodes = nbHidden;
        this.outputNodes = nbOutput;

        // Initiate the Weights (Random 0 -> 1)
        this.weights_ih = new Matrix(this.hiddenNodes, this.inputNodes);
        this.weights_ho = new Matrix(this.outputNodes, this.hiddenNodes);
        this.weights_ih.randomize();
        this.weights_ho.randomize();

        // Initiate the Bias (Random 0 -> 1)
        this.bias_hidden = new Matrix(this.hiddenNodes, 1);
        this.bias_output = new Matrix(this.outputNodes, 1);
        this.bias_hidden.randomize();
        this.bias_output.randomize();

        // Set Learning Rate
        this.learningRate = 0.1;

        // Set Activation function
        this.activation = sigmoid;
        this.deactivation = dsigmoid;
    }

    feedforward(inputArray){
        // Convert inputs from Array to Matrix
        let input;
        if(inputArray instanceof Matrix)
            input = inputArray;
        else
            input = Matrix.fromArray(inputArray);

        // Feed Forward to the first layer (I -> H)
        let hidden = Matrix.dot(this.weights_ih, input);
        hidden = Matrix.add(hidden, this.bias_hidden);
        hidden = hidden.map(e => this.activation(e));

        // Feed Forward to the last layer (H -> O)
        let output = Matrix.dot(this.weights_ho, hidden);
        output = Matrix.add(output, this.bias_output);
        output = output.map(e => this.activation(e));

        // Return the output as Array
        return Matrix.toArray(output);
    }

    train(inputArray, targetArray){
        /* ====== Feed Forwad ====== */

        // Convert inputs from Array to Matrix
        let input;
        if(inputArray instanceof Matrix)
        input = inputArray;
        else
            input = Matrix.fromArray(inputArray);

        // Feed Forward to the first layer (I -> H)
        let hidden = Matrix.dot(this.weights_ih, input);
        hidden = Matrix.add(hidden, this.bias_hidden);
        hidden = hidden.map(e => this.activation(e));

        // Feed Forward to the last layer (H -> O)
        let output = Matrix.dot(this.weights_ho, hidden);
        output = Matrix.add(output, this.bias_output);
        output = output.map(e => this.activation(e));

        /* ====== Back Propagation ====== */

        // Convert targets from Array to Matrix
        let target;
        if(targetArray instanceof Matrix)
            target = targetArray;
        else
            target = Matrix.fromArray(targetArray);

        // Calculate Errors
        let outputError = Matrix.substract(target, output);

        let weights_ho_transpose = Matrix.transpose(this.weights_ho);
        let hiddenError = Matrix.dot(weights_ho_transpose, outputError);

        // Gradient for the H -> O
        let outputGradient = output.map(e => this.deactivation(e));
        outputGradient = Matrix.multiply(outputGradient, outputError);
        outputGradient = Matrix.multiply(outputGradient, this.learningRate);

        // Gradient for the I -> H
        let hiddenGradient = hidden.map(e => this.deactivation(e));
        hiddenGradient = Matrix.multiply(hiddenGradient, hiddenError);
        hiddenGradient = Matrix.multiply(hiddenGradient, this.learningRate);

        // Delta for H -> O
        let hiddentTranspose = Matrix.transpose(hidden);
        let weights_ho_delta = Matrix.dot(outputGradient, hiddentTranspose);

        // Delta for I -> H
        let inputTranspose = Matrix.transpose(input);
        let weights_ih_delta = Matrix.dot(hiddenGradient, inputTranspose);


        // Adjust Weights for H -> O
        this.weights_ho = Matrix.add(this.weights_ho, weights_ho_delta);
        // Adjust Bias for H -> O
        this.bias_output = Matrix.add(this.bias_output, outputGradient);
        // Adjust Weights for I -> H
        this.weights_ih = Matrix.add(this.weights_ih, weights_ih_delta);
        // Adjust Bias for I -> H
        this.bias_hidden = Matrix.add(this.bias_hidden, hiddenGradient);

        // Return the output as Array
        return Matrix.toArray(output);
    }
}