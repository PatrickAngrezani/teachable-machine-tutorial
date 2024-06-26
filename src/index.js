const STATUS = document.getElementById("status");
const VIDEO = document.getElementById("webcam");
const ENABLE_CAM_BUTTON = document.getElementById("enableCam");
const RESET_BUTTON = document.getElementById("reset");
const TRAIN_BUTTON = document.getElementById("train");
const MOBILE_NET_INPUT_WIDTH = 224;
const MOBILE_NET_INPUT_HEIGHT = 224;
const STOP_DATA_GATHER = -1;
const CLASS_NAMES = [];

ENABLE_CAM_BUTTON.addEventListener("click", enableCam);
TRAIN_BUTTON.addEventListener("click", trainAndPredict);
RESET_BUTTON.addEventListener("click", reset);

function hasGetUserMedia() {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
}

function enableCam() {
  if (hasGetUserMedia) {
    //get user parameters
    const constraints = {
      video: true,
      width: 640,
      height: 480,
    };

    //activate the webcam stream
    navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {
      VIDEO.srcObject = stream;
      VIDEO.addEventListener("loadeddata", function () {
        videoPlaying = true;
        ENABLE_CAM_BUTTON.classList.add("removed");
      });
    });
  } else {
    console.warn("getUserMedia() is not supported by your browser");
  }
}

function trainAndPredict() {
  // TODO: Fill this out later in the codelab!
}

function reset() {
  // TODO: Fill this out later in the codelab!
}

let dataCollectorButtons = document.querySelectorAll("button.dataCollector");
for (let i = 0; i < dataCollectorButtons.length; i++) {
  dataCollectorButtons[i].addEventListener("mousedown", gatherDataForClass);
  dataCollectorButtons[i].addEventListener("mouseup", gatherDataForClass);
  //Populate the human readable names for classes
  CLASS_NAMES.push(dataCollectorButtons[i].getAttribute("data-name"));
}

function gatherDataForClass() {
  // TODO: Fill this out later in the codelab!
}

let mobilenet;
let datherDataState = STOP_DATA_GATHER;
let videoPlaying = false;
let trainingDataInputs = [];
let trainingDataOutputs = [];
let examplesCount = [];
let predict = false;

async function loadMobileNetFeatureModel() {
  const URL =
    "https://tfhub.dev/google/tfjs-model/imagenet/mobilenet_v3_small_100_224/feature_vector/5/default/1";

  mobilenet = await tf.loadGraphModel(URL, { fromTFHub: true });
  STATUS.innerText = "MobileNet v3 loaded succesfully";

  //warm up the model by passing zeros through it once
  tf.tidy(function () {
    let answer = mobilenet.predict(
      tf.zeros[(1, MOBILE_NET_INPUT_HEIGHT, MOBILE_NET_INPUT_WIDTH, 3)]
    );
    console.log({ asnswer: answer.shpe });
  });
}

//call function immediately to start loading
loadMobileNetFeatureModel();

let model = tf.sequential();
console.log({ model });
model.add(
  tf.layers.dense({ inputShape: [1024], units: 128, activation: "relu" })
);
model.add(tf.layers.dense({ units: 2, activation: "softmax" }));

model.summary();

//compile the model with the defined optimizer and specify a loss fuction to use
model.compile({
  //adam changes the learning rate over time which is useful
  optimizer: "adam",
  //use the correct loss function. If 2 classes of data, must use binaryCrossentropy.
  //else categoricalCrossentropy is used if more than 2 classes
  loss:
    CLASS_NAMES.length === 2 ? "binaryCrossentropy" : "categoricalCrossentropy",
  //as this is a classification problem you can record accuracy in the logs too!
  metrics: ["accuracy"],
});
