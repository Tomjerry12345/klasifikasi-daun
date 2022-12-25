import { useEffect, useRef, useState } from "react";
import * as tf from "@tensorflow/tfjs";

import cacarDaunCengkeh from "../../assets/cacar-daun.jpg";
import embunJelaga from "../../assets/embun-jelaga.jpg";
import kutuDaun from "../../assets/kutu-daun.jpg";

const KlasifikasiLogic = () => {
  const fileInputRef = useRef(null);
  const imageRef = useRef(null);
  const [image, setImage] = useState({
    preview: "",
    raw: "",
  });

  const MOBILE_NET_INPUT_WIDTH = 224;
  const MOBILE_NET_INPUT_HEIGHT = 224;

  const CLASS_NAMES = ["cacar_daun_cengkeh", "embun_jelaga", "kutu_daun"];
  const [trainingDataInputs, setTrainingDataInputs] = useState([]);
  const [trainingDataOutputs, setTrainingDataOutputs] = useState([]);

  const [clasify, setClasify] = useState({
    cacar_daun_cengkeh: 0,
    embun_jelaga: 0,
    kutu_daun: 0,
  });

  const [detail, setDetail] = useState({
    title: "",
    deskripsi: "",
    image: "",
  });

  const [mobilenet, setMobileNet] = useState(null);

  const [customModel, setCustomModel] = useState();

  const [stateSum, setStateSum] = useState(0);

  const [loading, setLoading] = useState(true);

  const [open, setOpen] = useState(false);

  const createModel = false;

  const path = process.env.PUBLIC_URL;

  const jumlahData = 40;
  let proses = 1;
  let endProses = jumlahData * CLASS_NAMES.length;

  useEffect(() => {
    // const loadModel = async () => {
    //   const model = await tf.loadLayersModel(`${publicUrl}/model/my-model.json`);
    //   setCustomModel(model);
    //   setLoading(false);
    // };

    console.log("stateSum", stateSum);

    if (stateSum > 1) {
      preparation();
    } else {
      if (mobilenet === null) {
        loadMobileNetFeatureModel();
      }
    }
  }, [mobilenet]);

  useEffect(() => {
    if (trainingDataInputs.length >= jumlahData) {
      train();
    }
  }, [trainingDataInputs]);

  useEffect(() => {
    if (!loading) {
      predict(imageRef.current);
    }
  }, [image.preview]);

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
    });

    // head();

    setStateSum((old) => old + 1);

    setMobileNet(mobilenet1);
  }

  const preparation = async () => {
    const pathCacarDaunCengkeh = `${path}dataset/cacar_daun_cengkeh`;
    const pathEmbunJelaga = `${path}dataset/embun_jelaga`;
    const pathKutuDaun = `${path}dataset/kutu_daun`;

    const cacarDaun = await olahImage(pathCacarDaunCengkeh);
    const embunJelaga = await olahImage(pathEmbunJelaga);
    const kutuDaun = await olahImage(pathKutuDaun);

    const training = [];
    const outputs = [];

    cacarDaun.forEach((val) => {
      training.push(val);
      outputs.push(0);
    });

    embunJelaga.forEach((val) => {
      training.push(val);
      outputs.push(1);
    });

    kutuDaun.forEach((val) => {
      training.push(val);
      outputs.push(2);
    });

    // setTrainingDataInputs((old) => [...old, imageFeatures]);
    // setTrainingDataOutputs((old) => [...old, y]);

    console.log("outputs", outputs);

    let class0 = 0;
    let class1 = 0;
    let class2 = 0;

    outputs.forEach((val) => {
      if (val === 0) {
        class0 += 1;
      } else if (val === 1) {
        class1 += 1;
      } else if (val === 2) {
        class2 += 1;
      } else {
        console.log("missing");
      }
    });

    console.log("class0", class0);
    console.log("class1", class1);
    console.log("class2", class2);

    setTrainingDataInputs(training);
    setTrainingDataOutputs(outputs);

    // console.log("test")
  };

  const olahImage = (path) => {
    const image = [];

    for (let i = 1; i <= jumlahData; i++) {
      image.push(`${path}/${i}.jpg`);
    }

    const res = Promise.all(
      image.map((val) => {
        const im = new Image();
        im.src = val;

        return new Promise((resolve, rejected) => {
          im.onload = () => {
            // console.log("image", im.src);
            const p = endProses / 100;
            console.log(`proses`, `${parseFloat(proses / p).toFixed(2)}%`);
            const image = getImageData(im);
            proses++;
            resolve(image);
            // resolve(im.src);
          };
          im.onerror = () => {
            console.log("error", im.src);
            // getImageData(im, y[z]);
            rejected();
          };
        });
      })
    );

    return res;
  };

  const getImageData = (image) => {
    let imageFeatures = tf.tidy(function () {
      let imageFrameAsTensor = tf.browser.fromPixels(image, 3);
      let resizedTensorFrame = tf.image.resizeBilinear(
        imageFrameAsTensor,
        [MOBILE_NET_INPUT_HEIGHT, MOBILE_NET_INPUT_WIDTH],
        true
      );
      let normalizedTensorFrame = resizedTensorFrame.div(255);
      // const cast = resizedTensorFrame.cast("float32");
      return mobilenet.predict(normalizedTensorFrame.expandDims()).squeeze();
    });

    return imageFeatures;
  };

  const model = () => {
    let inputShape = [1024];
    // let inputShape = [224, 224, 3];
    let units = 128;
    let activation = "softmax";
    let jumlahClass = 3;

    let model = tf.sequential();
    model.add(
      tf.layers.dense({
        inputShape: inputShape,
        units: units,
        activation: "relu",
      })
    );
    model.add(tf.layers.dense({ units: jumlahClass, activation: activation }));

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
    let shuffle = true;
    let batchSize = 5;
    let epochs = 10;

    tf.util.shuffleCombo(trainingDataInputs, trainingDataOutputs);
    let outputsAsTensor = tf.tensor1d(trainingDataOutputs, "int32");
    let oneHotOutputs = tf.oneHot(outputsAsTensor, CLASS_NAMES.length);
    let inputsAsTensor = tf.stack(trainingDataInputs);
    console.log("werty = ", outputsAsTensor);

    let results = await model().fit(inputsAsTensor, oneHotOutputs, {
      shuffle: shuffle,
      batchSize: batchSize,
      epochs: epochs,
      callbacks: { onEpochEnd: logProgress },
    });

    // await model().save("downloads://my-model");

    // setCustomModel(model());

    outputsAsTensor.dispose();
    oneHotOutputs.dispose();
    inputsAsTensor.dispose();

    console.log("selesai");

    setLoading(false);

    // loadImageTest();
  }

  const predict = (image) => {
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

      const score0 = Math.floor(predictionArray[0] * 100);
      const score1 = Math.floor(predictionArray[1] * 100);
      const score2 = Math.floor(predictionArray[2] * 100);

      // console.log("predict : ", `${CLASS_NAMES[highestIndex]} = ${score} %`);
      // console.log("predictionArray[highestIndex] : ", predictionArray);

      console.log("highestIndex", highestIndex);

      setClasify({
        ...clasify,
        cacar_daun_cengkeh: score0,
        embun_jelaga: score1,
        kutu_daun: score2,
      });

      if (highestIndex === 0) {
        setDetail({
          title: "Cacar Daun Cengkeh",
          deskripsi: "cacar daun cengkeh",
          image: cacarDaunCengkeh,
        });
      } else if (highestIndex === 1) {
        setDetail({
          title: "Embun Jelaga",
          deskripsi: "embun jelaga",
          image: embunJelaga,
        });
      }
      if (highestIndex === 2) {
        setDetail({
          title: "Kutu Daun",
          deskripsi: "kutu daun",
          image: kutuDaun,
        });
      }
    });
  };

  function logProgress(epoch, logs) {
    console.log("Data for epoch " + epoch, logs);
  }

  const onChangeUploadImage = async (e) => {
    const img = e.target.files;
    if (img.length) {
      setImage({
        preview: URL.createObjectURL(img[0]),
        raw: img[0],
      });
    }
  };

  const uploadClick = () => {
    fileInputRef.current.click();
  };

  const onDetail = () => {
    setOpen(true);
  };

  return {
    value: {
      image,
      loading,
      clasify,
      fileInputRef,
      imageRef,
      open,
      detail,
    },
    func: {
      onChangeUploadImage,
      uploadClick,
      setOpen,
      onDetail,
    },
  };
};

export default KlasifikasiLogic;
