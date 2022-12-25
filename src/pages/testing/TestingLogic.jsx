import { createRef, useEffect } from "react";
import * as tf from "@tensorflow/tfjs";
import { useState } from "react";

const TestingLogic = () => {
  const ref = createRef();
  const MOBILE_NET_INPUT_WIDTH = 224;
  const MOBILE_NET_INPUT_HEIGHT = 224;
  const CLASS_NAMES = ["baik", "buruk"];
  const [trainingDataInputs, setTrainingDataInputs] = useState([]);
  const [trainingDataOutputs, setTrainingDataOutputs] = useState([]);

  const sumData = 102;

  const [mobilenet, setMobileNet] = useState(null);

  const [stateSum, setStateSum] = useState(0);

  useEffect(() => {
    if (stateSum > 1) {
      preparation();
    } else {
      if (mobilenet === null) {
        loadMobileNetFeatureModel();
      }
    }
  }, [mobilenet]);

  useEffect(() => {
    console.log("trainingDataInputs", trainingDataInputs);
    console.log("trainingDataOutput", trainingDataOutputs);

    if (trainingDataInputs.length >= sumData) {
      train();
    }
  }, [trainingDataInputs]);

  const preparation = () => {
    olahImage("dataset/baik", 0);
    olahImage("dataset/buruk", 1);
  };

  const olahImage = (base, y) => {
    for (let i = 0; i <= 51; i++) {
      const im = new Image();
      //   im.src = "/dataset/baik/1.JPG";
      im.src = `/${base}/${i}.jpg`;
      const ctx = ref.current.getContext("2d");

      im.onload = () => {
        const width = im.naturalWidth;
        const height = im.naturalHeight;
        //   const a = tf.browser.fromPixels(im, 4);
        //   a.print();
        //   console.log(a.shape);

        getImageData(im, y);

        ctx.font = "30px Arial";
        ctx.fillText("Processing....", 10, 50);
      };
    }
  };

  const getImageData = (image, y) => {
    let imageFeatures = tf.tidy(function () {
      let imageFrameAsTensor = tf.browser.fromPixels(image, 3);
      let resizedTensorFrame = tf.image.resizeBilinear(
        imageFrameAsTensor,
        [MOBILE_NET_INPUT_HEIGHT, MOBILE_NET_INPUT_WIDTH],
        true
      );
      let normalizedTensorFrame = resizedTensorFrame.div(255);
      return mobilenet.predict(normalizedTensorFrame.expandDims()).squeeze();
    });

    console.log("imageFeatures", imageFeatures);

    setTrainingDataInputs((old) => [...old, imageFeatures]);
    setTrainingDataOutputs((old) => [...old, y]);
  };

  async function loadMobileNetFeatureModel() {
    const URL =
      "https://tfhub.dev/google/tfjs-model/imagenet/mobilenet_v3_small_100_224/feature_vector/5/default/1";

    const mobilenet1 = await tf.loadGraphModel(URL, { fromTFHub: true });

    console.log("MobileNet v3 loaded successfully!");

    // Warm up the model by passing zeros through it once.
    tf.tidy(function () {
      let answer = mobilenet1.predict(
        tf.zeros([1, MOBILE_NET_INPUT_HEIGHT, MOBILE_NET_INPUT_WIDTH, 3])
      );
      console.log("shape", answer.shape);
    });

    // head();

    setStateSum((old) => old + 1);

    setMobileNet(mobilenet1);
  }

  const model = () => {
    let model = tf.sequential();
    model.add(
      tf.layers.dense({ inputShape: [1024], units: 128, activation: "relu" })
    );
    model.add(
      tf.layers.dense({ units: CLASS_NAMES.length, activation: "softmax" })
    );

    model.summary();

    // Compile the model with the defined optimizer and specify a loss function to use.
    model.compile({
      // Adam changes the learning rate over time which is useful.
      optimizer: "adam",
      // Use the correct loss function. If 2 classes of data, must use binaryCrossentropy.
      // Else categoricalCrossentropy is used if more than 2 classes.
      loss:
        CLASS_NAMES.length === 2
          ? "binaryCrossentropy"
          : "categoricalCrossentropy",
      // As this is a classification problem you can record accuracy in the logs too!
      metrics: ["accuracy"],
    });
    return model;
  };

  async function train() {
    tf.util.shuffleCombo(trainingDataInputs, trainingDataOutputs);
    let outputsAsTensor = tf.tensor1d(trainingDataOutputs, "int32");
    let oneHotOutputs = tf.oneHot(outputsAsTensor, CLASS_NAMES.length);
    let inputsAsTensor = tf.stack(trainingDataInputs);

    let results = await model().fit(inputsAsTensor, oneHotOutputs, {
      shuffle: true,
      batchSize: 5,
      epochs: 10,
      callbacks: { onEpochEnd: logProgress },
    });

    outputsAsTensor.dispose();
    oneHotOutputs.dispose();
    inputsAsTensor.dispose();

    console.log("selesai");

    loadImageTest();
  }

  const predict = (image, ctx) => {
    tf.tidy(function () {
      let imageFrameAsTensor = tf.browser.fromPixels(image).div(255);
      let resizedTensorFrame = tf.image.resizeBilinear(
        imageFrameAsTensor,
        [MOBILE_NET_INPUT_HEIGHT, MOBILE_NET_INPUT_WIDTH],
        true
      );

      let imageFeatures = mobilenet.predict(resizedTensorFrame.expandDims());
      let prediction = model().predict(imageFeatures).squeeze();
      let highestIndex = prediction.argMax().arraySync();
      let predictionArray = prediction.arraySync();

      ctx.drawImage(image, 10, 0, image.naturalWidth, image.naturalHeight);
      ctx.fillText(
        `${CLASS_NAMES[highestIndex]} = ${predictionArray[highestIndex]} confidence`,
        10,
        260
      );

      // alert(
      //   "Prediction: " +
      //     CLASS_NAMES[highestIndex] +
      //     " with " +
      //     Math.floor(predictionArray[highestIndex] * 100) +
      //     "% confidence"
      // );
    });
  };

  const loadImageTest = () => {
    const base = "dataset/baik";
    const im = new Image();
    // im.src = "/dataset/baik/20.jpg";
    im.src = `/${base}/1.jpg`;
    const ctx = ref.current.getContext("2d");

    im.onload = () => {
      // const width = im.naturalWidth;
      // const height = im.naturalHeight;

      predict(im, ctx);
    };
  };

  function logProgress(epoch, logs) {
    console.log("Data for epoch " + epoch, logs);
  }

  return {
    ref,
  };
};

export default TestingLogic;
