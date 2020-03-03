const Matrix = require("./Matrix");

function sigmoid(x) {
  return 1 / (1 + Math.exp(-x));
}
function dsigmoid(y) {
  return y * (1 - y);
}

//Does not work (yet)
function ReLU(x) {
  if (x <= 0) return 0;
  else return x;
}
//Does not work (yet)
function dReLU(y) {
  if (y <= 0) return 0;
  else return 1;
}

class NeuralNetwork {
  constructor(architecture) {
    // Array that define the number of neurones on each layers : [I, H1, H2, ..., Hn, O]
    this.architecture = architecture;

    // Weights array = [W(i_h1), W(h1_h2), ..., W(hn_o)]
    this.weights = [];
    // Bias array = [B(i_h1), B(h1_h2), ..., B(hn_o)]
    this.bias = [];

    // Initialize the Weights and Bias
    // For each layers (without Input layer) : {i = (H1 -> O)}
    for (let i = 1; i < this.architecture.length; i++) {
      // Create a new Weight W(i-1_i)
      let weight = new Matrix(this.architecture[i], this.architecture[i - 1]);
      // Randomize W(i-1_i) (Between 0 -> 1)
      weight.randomize();

      // Create a new Bias B(i-1_i)
      let bia = new Matrix(this.architecture[i], 1);
      // Randomize B(i-1_i) (Between 0 -> 1)
      bia.randomize();

      // Add W(i-1_i) to Weights array
      this.weights.push(weight);
      // Add B(i-1_i) to Bias array
      this.bias.push(bia);
    }

    // Set Learning Rate
    this.learningRate = 0.1;

    // Set Activation function
    this.activation = sigmoid;
    // Set De-Activation function
    this.deactivation = dsigmoid;
  }

  feedforward(inputArray) {
    // Convert inputs from Array to Matrix
    let input;
    if (inputArray instanceof Matrix) input = inputArray;
    else input = Matrix.fromArray(inputArray);

    // Create Layers array (contain each layers outputs) : [I, H1, H2, ..., Hn, O]
    let layers = [];
    // Put Inputs as first layer
    layers.push(input);

    // For each Weights in Weights array
    for (let i = 0; i < this.weights.length; i++) {
      // Calculate weighted sum for the layer
      let layer = Matrix.dot(this.weights[i], layers[i]);
      // Add the Bias
      layer = Matrix.add(layer, this.bias[i]);
      // Pass the result throught the activation function
      layer = layer.map(e => this.activation(e));

      // Add the output to the Layers array
      layers.push(layer);
    }

    // Return the output (last layer) as Array
    let output = layers[layers.length - 1];
    return Matrix.toArray(output);
  }

  train(inputArray, targetArray) {
    /* ====== Feed Forwad ====== */

    // Convert inputs from Array to Matrix
    let input;
    if (inputArray instanceof Matrix) input = inputArray;
    else input = Matrix.fromArray(inputArray);

    // Create Layers array (contain each layers outputs) : [I, H1, H2, ..., Hn, O]
    let layers = [];
    // Put Inputs as first layer
    layers.push(input);

    // For each Weights in Weights array
    for (let i = 0; i < this.weights.length; i++) {
      // Calculate weighted sum for the layer
      let layer = Matrix.dot(this.weights[i], layers[i]);
      // Add the Bias
      layer = Matrix.add(layer, this.bias[i]);
      // Pass the result throught the activation function
      layer = layer.map(e => this.activation(e));

      // Add the output to the Layers array
      layers.push(layer);
    }

    // Set output as last layer result
    let output = layers[layers.length - 1];

    /* ====== Back Propagation ====== */

    // Convert targets from Array to Matrix
    let target;
    if (targetArray instanceof Matrix) target = targetArray;
    else target = Matrix.fromArray(targetArray);

    // === Calculate Errors ===
    // Create Errors array (contain each layers error) : [H1, H2, ..., Hn, O]
    let errors = [];

    // Set first error (O) as Target - Output
    let previousError = Matrix.substract(target, output);
    // Add first error to Errors array
    errors.push(previousError);

    // For each weights (inverted, minus the first one) : {i = (W(hn_o) -> W(h1_h2))}
    for (let i = this.weights.length - 1; i > 0; i--) {
      // Transpose the weight [i]
      let weight_transpose = Matrix.transpose(this.weights[i]);
      // Calculate the error [i]
      let error = Matrix.dot(weight_transpose, previousError);

      // Add error [i] to Errors array
      errors.push(error);
      // Save error [i] for next itteration
      previousError = error;
    }
    // Reverse the Error array : [O, Hn, ..., H2, H1] -> [H1, H2, ..., Hn, O]
    errors = errors.reverse();

    // === Calculate Gradients ===
    // Create Gradients array (contain each weights gradient) : [G(i_h1), G(h1_h2), ..., G(hn_o)]
    let gradients = [];
    // For each Layer (inverted, minus the first one) : {i = (O -> H1)}
    for (let i = layers.length - 1; i > 0; i--) {
      // De-activate the layer [i]
      let gradient = layers[i].map(e => this.deactivation(e));
      // Multiply it by the Error [i-1] (Errors array is 1 shorter than Layer array)
      gradient = Matrix.multiply(gradient, errors[i - 1]);
      // Multiply it by the Learning Rate
      gradient = Matrix.multiply(gradient, this.learningRate);

      // Add the Gradient [i] to Gradients array
      gradients.push(gradient);
    }
    // Reverse the Gradients array : [G(hn_o), ..., G(h1_h2), G(i_h1)] -> [G(i_h1), G(h1_h2), ..., G(hn_o)]
    gradients = gradients.reverse();

    // === Calculate Deltas ===
    // Create Delta array (contain each weights delta) : [d(i_h1), d(h1_h2), ..., d(hn_o)]
    let deltas = [];
    // For each Layer (inverted, minus the last one) : {i = (Hn -> I)}
    for (let i = layers.length - 2; i >= 0; i--) {
      // Transpose the Layer [i]
      let layerTranspose = Matrix.transpose(layers[i]);
      // Calculate the Delta [i]
      let delta = Matrix.dot(gradients[i], layerTranspose);

      // Add the Delta [i] to Deltas array
      deltas.push(delta);
    }
    // Reverse the Deltas array : [d(hn_o), ..., d(h1_h2), d(i_h1)] -> [d(i_h1), d(h1_h2), ..., d(hn_o)]
    deltas = deltas.reverse();

    // === Correct Weights and Bias ===
    // For each Weights (and for each Bias) : {i = (W(h1_h2) -> W(hn_o))}
    for (let i = 0; i < this.weights.length; i++) {
      // Adjust Weight [i]
      this.weights[i] = Matrix.add(this.weights[i], deltas[i]);
      // Adjust Bia [i]
      this.bias[i] = Matrix.add(this.bias[i], gradients[i]);
    }

    // Return the output as Array
    return Matrix.toArray(output);
  }
}

module.exports = NeuralNetwork;
