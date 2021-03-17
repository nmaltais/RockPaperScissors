let mobilenet;
let model;
let computerPoints = 0;
let playerPoints = 0;
const webcam = new Webcam(document.getElementById('wc'));

async function loadMobilenet() {
  const mobilenet = await tf.loadLayersModel('https://storage.googleapis.com/tfjs-models/tfjs/mobilenet_v1_1.0_224/model.json');
  const layer = mobilenet.getLayer('conv_pw_13_relu');
  return tf.model({inputs: mobilenet.inputs, outputs: layer.output});
}

async function loadModel() {
  const model = await tf.loadLayersModel('http://localhost:8081/models/my_model.json');
  return model;
}

async function predict() {
  const predictedClass = tf.tidy(() => {
    const img = webcam.capture();
    const activation = mobilenet.predict(img);
    const predictions = model.predict(activation);
    // console.log(predictions);
    // console.log(predictions.print());
    // console.log(predictions.values);
    // console.log(predictions.as1D());
    // console.log(predictions.as1D().argMax());
    return predictions.as1D().argMax();
  });
  const classId = (await predictedClass.data())[0];
  const predictionText = hotDecode(classId);
  document.getElementById("playerPrediction").innerText = 'Player: ' + predictionText;

  predictedClass.dispose();
  return predictionText;
}

function hotDecode(num) {
  switch(num){
		case 0:
			return "Rock";
		case 1:
			return "Paper";
		case 2:
      return "Scissors";
    default:
      return "Error";
	}
}

async function startPredicting(){
	isPredicting = true;
	while (isPredicting) {
    predict();
    await tf.nextFrame();
  }
}

function stopPredicting(){
	isPredicting = false;
	predict();
}


function saveModel(){
    model.save('downloads://my_model');
}

function countDown(arr = ['','Rock...', 'Paper...', 'Scissors...', 'Shoot!'], index = 0) {
  document.getElementById("UI").innerHTML = arr[index];
  if(index < arr.length-1) {
    $("#UI").attr('data-countdown', arr[index]);
    setTimeout( ()=>{countDown(arr, index+1)}, 700);
  } else {
    $("#UI").attr('data-countdown', 'Shoot!');
    setTimeout( async ()=>{
      document.getElementById("outcome").innerHTML = await evaluateGame(); 
      $("#outcome").animate({
        "font-size" : '+=30px',
        "opacity" : 0,
        "top" : '-=200px',
      }
      , 2000
      , ()=>{
          $("#outcome").html('').animate({
            "font-size" : '-=30px',
            "opacity" : 100,
            "top" : '+=200px',
          }, 0);
        }
      );
      updateScore();
      document.getElementById("UI").innerHTML = '<button id="playBtn" onClick="countDown()">Play</button>'
    }, 700);
  }
}
async function evaluateGame() {
  //Get picks
  const Player = await predict();
  const PCU = computerPick();
  // key "beats" value
  rules = {
    'Rock': 'Scissors',
    'Paper': 'Rock',
    'Scissors': 'Paper'
  };
  //Evaluate winner
  if (PCU == Player) {
    playerPoints += 1;
    computerPoints += 1;
    return "Draw";
  } 
  else if (PCU == rules[Player]) {
    playerPoints++;
    return "Player Wins";
  } else {
    computerPoints++;
    return "PCU Wins";
  }
}
function updateScore () {
  document.getElementById("playerScore").innerHTML = playerPoints <= 9 ? `0${playerPoints}` : playerPoints;
  document.getElementById("computerScore").innerHTML = computerPoints <= 9 ? `0${computerPoints}` : computerPoints;
}
function computerPick() {
  const opts = ['Rock', 'Paper', 'Scissors'];
  const idx = Math.floor(Math.random() * 3);
  document.getElementById("computerPrediction").innerText = 'PCU: ' + opts[idx];
  document.getElementById("computerImg").setAttribute('data-pick', opts[idx]);
  return opts[idx];
}
async function init(){
  document.getElementById('UI').innerHTML = 'Setting up webcam...';
	await webcam.setup();
  document.getElementById('UI').innerHTML = 'Loading model...';
	mobilenet = await loadMobilenet();
  tf.tidy(() => mobilenet.predict(webcam.capture()));
  model = await loadModel();
  document.getElementById('UI').innerHTML = '<button id="playBtn" onClick="countDown()">Play</button>';
}
window.odometerOptions = {
  duration: 900,
  theme: 'train-station',
};

init();