import { createRef, useEffect, useRef, useState } from "react";
import * as tf from "@tensorflow/tfjs";
import * as tfvis from "@tensorflow/tfjs-vis";
import { publicUrl } from "../../values/Constant";

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

  const sumData = 298;

  const [mobilenet, setMobileNet] = useState(null);

  const [customModel, setCustomModel] = useState();

  const [stateSum, setStateSum] = useState(0);

  const [loading, setLoading] = useState(true);

  const [open, setOpen] = useState(false);

  const createModel = false;

  const path = process.env.PUBLIC_URL;

  // useEffect(() => {}, [image.preview]);

  useEffect(() => {
    const loadModel = async () => {
      const model = await tf.loadLayersModel(`${publicUrl}/model/my-model.json`);
      setCustomModel(model);
      setLoading(false);
    };

    // console.log("load model", loadModel());

    // if (createModel === true) {
    alert(`stateSum => ${stateSum}`);
    if (stateSum > 0) {
      preparation();
    } else {
      if (mobilenet === null) {
        loadMobileNetFeatureModel();
      }
    }
    // } else {
    //   loadModel();
    // }
  }, [mobilenet]);

  useEffect(() => {
    // console.log("trainingDataInputs", trainingDataInputs);
    // console.log("trainingDataOutput", trainingDataOutputs);

    if (trainingDataInputs.length >= sumData) {
      train();
    }
  }, [trainingDataInputs]);

  useEffect(() => {
    if (!loading) {
      predict(imageRef.current);
    }
  }, [image.preview]);

  const preparation = () => {
    olahImage(`${path}dataset/cacar_daun_cengkeh`, 0);
    olahImage(`${path}dataset/embun_jelaga`, 1);
    olahImage(`${path}dataset/kutu_daun`, 2);
  };

  const olahImage = (base, y) => {
    console.log("base", base);
    for (let i = 1; i <= 100; i++) {
      const im = new Image();
      im.src = `/${base}/${i}.jpg`;

      im.onload = () => {
        const width = im.naturalWidth;
        const height = im.naturalHeight;
        console.log("image", im.src);
        console.log("y", y);
        //   const a = tf.browser.fromPixels(im, 4);
        //   a.print();
        //   console.log(a.shape);

        getImageData(im, y);

        // ctx.font = "30px Arial";
        // ctx.fillText("Processing....", 10, 50);
      };
    }
  };

  const getImageData = (image, y) => {
    let imageFeatures = tf.tidy(function () {
      let imageFrameAsTensor = tf.browser.fromPixels(image, 3);
      let resizedTensorFrame = tf.image.resizeBilinear(imageFrameAsTensor, [MOBILE_NET_INPUT_HEIGHT, MOBILE_NET_INPUT_WIDTH], true);
      let normalizedTensorFrame = resizedTensorFrame.div(255);
      return mobilenet.predict(normalizedTensorFrame.expandDims()).squeeze();
    });

    setTrainingDataInputs((old) => [...old, imageFeatures]);
    setTrainingDataOutputs((old) => [...old, y]);
  };

  async function loadMobileNetFeatureModel() {
    const URL = "https://tfhub.dev/google/tfjs-model/imagenet/mobilenet_v3_small_100_224/feature_vector/5/default/1";

    const mobilenet1 = await tf.loadGraphModel(URL, { fromTFHub: true });

    console.log("MobileNet v3 loaded successfully!");

    // Warm up the model by passing zeros through it once.
    tf.tidy(function () {
      let answer = mobilenet1.predict(tf.zeros([1, MOBILE_NET_INPUT_HEIGHT, MOBILE_NET_INPUT_WIDTH, 3]));
    });

    // head();

    setStateSum((old) => old + 1);

    setMobileNet(mobilenet1);
  }

  const model = () => {
    let inputShape = [1024];
    // let inputShape = [224, 224, 3];
    let units = 128;
    let activation = "softmax";
    let jumlahClass = 3;

    let model = tf.sequential();
    model.add(tf.layers.dense({ inputShape: inputShape, units: units, activation: "relu" }));
    model.add(tf.layers.dense({ units: jumlahClass, activation: activation }));

    model.summary();

    // Compile the model with the defined optimizer and specify a loss function to use.
    model.compile({
      // Adam changes the learning rate over time which is useful.
      optimizer: "adam",
      // Use the correct loss function. If 2 classes of data, must use binaryCrossentropy.
      // Else categoricalCrossentropy is used if more than 2 classes.
      loss: CLASS_NAMES.length === 2 ? "binaryCrossentropy" : "categoricalCrossentropy",
      // As this is a classification problem you can record accuracy in the logs too!
      metrics: ["accuracy"],
    });
    return model;
  };

  async function train() {
    let class0 = 0;
    let class1 = 0;
    let class2 = 0;

    let shuffle = true;
    let batchSize = 5;
    let epochs = 10;

    // console.log("trainingDataInputs", trainingDataInputs);
    console.log("trainingDataOutputs", trainingDataOutputs);

    trainingDataOutputs.forEach((val) => {
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

    tf.util.shuffleCombo(trainingDataInputs, trainingDataOutputs);
    let outputsAsTensor = tf.tensor1d(trainingDataOutputs, "int32");
    let oneHotOutputs = tf.oneHot(outputsAsTensor, CLASS_NAMES.length);
    let inputsAsTensor = tf.stack(trainingDataInputs);

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
      let resizedTensorFrame = tf.image.resizeBilinear(imageFrameAsTensor, [MOBILE_NET_INPUT_HEIGHT, MOBILE_NET_INPUT_WIDTH], true);

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

  const loadImageTest = () => {
    const base = "dataset/baik";
    const im = new Image();
    // im.src = "/dataset/baik/20.jpg";
    im.src = `/${base}/1.jpg`;
    // const ctx = ref.current.getContext("2d");

    im.onload = () => {
      // const width = im.naturalWidth;
      // const height = im.naturalHeight;

      predict(im);
    };
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
