let client = null; // MQTT 클라이언트의 역할을 하는 Client 객체를 가리키는 전역변수
let connectionFlag = false; // 연결 상태이면 true
const CLIENT_ID = "client-" + Math.floor((1 + Math.random()) * 0x310000000).toString(16) // 사용자 ID 랜덤 생성

var chatBox = document.querySelector("#messages"); // 특정 메시지 출력 박스

const topics = ["led", "feed", "water", "ultrasonic", "temperate", "humidity", "moving", "flagTemp", "flagHumidity", "setedTemp", "setedHumidity"] // 구독 할 토픽

const timeStamp = () => { // 메시지 타임 스탬프 표시
  const currentTime = new Date();
  const hours = currentTime.getHours().toString().padStart(2, '0');
  const minutes = currentTime.getMinutes().toString().padStart(2, '0');
  return `[${hours}:${minutes}]`;
}

const chatBoxCheck = () => { // chatBox에 일정 높이 이상 메시지가 추가될 경우 제일 오래된 메시지 삭제
  while (chatBox.scrollHeight > 310) {
    chatBox.removeChild(chatBox.firstChild);
  }
}

function connect() { // 브로커에 접속하는 함수
  if (connectionFlag == true)
    return; // 현재 연결 상태이므로 다시 연결하지 않음
  // 사용자가 입력한 브로커의 IP 주소와 포트 번호 알아내기
  let broker = document.getElementById("broker").value; // 브로커의 IP 주소
  let port = 9001 // mosquitto를 웹소켓으로 접속할 포트 번호

  // id가 message인 DIV 객체에 브로커의 IP와 포트 번호 출력
  var newMsg = document.createElement('div');
  var timeFormat = timeStamp();
  newMsg.textContent = `${timeFormat} 접속 : ${broker} 포트 ${port}`;
  chatBox.appendChild(newMsg);
  chatBoxCheck();
  var newMsg = document.createElement('div');
  var timeFormat = timeStamp();
  newMsg.textContent = `${timeFormat}` + ' 사용자 ID : ' + CLIENT_ID + '';
  chatBox.appendChild(newMsg);
  chatBoxCheck();

  // MQTT 메시지 전송 기능을 모두 가징 Paho client 객체 생성
  client = new Paho.MQTT.Client(broker, Number(port), CLIENT_ID);

  // client 객체에 콜백 함수 등록 및 연결
  client.onConnectionLost = onConnectionLost; // 접속 끊김 시 onConnectLost() 실행 
  client.onMessageArrived = onMessageArrived; // 메시지 도착 시 onMessageArrived() 실행

  // client 객체에게 브로커에 접속 지시
  client.connect({
    onSuccess: onConnect, // 브로커로부터 접속 응답 시 onConnect() 실행
  });
}

// 브로커로의 접속이 성공할 때 호출되는 함수
function onConnect() {
  let newMsg = document.createElement('div');

  const timeFormat = timeStamp();
  newMsg.textContent = `${timeFormat}` + ' 연결 성공' + '';
  chatBox.appendChild(newMsg);
  chatBoxCheck();
  connectionFlag = true; // 연결 상태로 설정
  for (let i = 0; i < topics.length; i++) { // 연결이 성공하면 토픽들 구독
    subscribe(topics[i]);
  }
}

function subscribe(topic) {
  if (connectionFlag != true) { // 연결되지 않은 경우
    alert("연결되지 않았음");
    return false;
  }

  client.subscribe(topic); // 브로커에 구독 신청
  console.log("구독신청: 토픽 ", topic);
}
function publish(topic, msg) {
  if (connectionFlag != true) { // 연결되지 않은 경우
    alert("연결되지 않았음");
    return false;
  }
  client.send(topic, msg, 0, false);
  console.log(topic, "으로 ", msg, " 보냄");
  return true;
}

function unsubscribe(topic) {
  if (connectionFlag != true) return; // 연결되지 않은 경우
  client.unsubscribe(topic, null); // 브로커에 구독 신청 취소
  console.log("구독신청취소: 토픽 ", topic);
}

// 접속이 끊어졌을 때 호출되는 함수
function onConnectionLost(responseObject) { // responseObject는 응답 패킷
  if (responseObject.errorCode !== 0) {
    let newMsg = document.createElement('div');
    const timeFormat = timeStamp();
    newMsg.textContent = `${timeFormat}` + ' 오류 : ' +
      responseObject.errorMessage + '';
    chatBox.appendChild(newMsg);
    while (chatBox.scrollHeight > 310) {
      chatBox.removeChild(chatBox.firstChild);
    }
  }
  connectionFlag = false; // 연결 되지 않은 상태로 설정
}

let flagTemp = false // 온도 자동 조절 사용 여부
let flagHumidity = false // 습도 자동 조절 사용 여부

// 메시지가 도착할 때 호출되는 함수
function onMessageArrived(msg) { // 매개변수 msg는 도착한 MQTT 메시지를 담고 있는 객체
  if (msg.destinationName != "image") // 메시지가 이미지가 아닌 값이면 콘솔에 출력
    console.log("onMessageArrived: " + msg.payloadString);
  if (msg.destinationName == "ultrasonic") { // 거리
    addChartData(0, parseInt(msg.payloadString)); // 거리 그래프의 data 추가
    document.querySelector("#msg-ultrasonic").innerHTML = `거리 : ${Number(msg.payloadString).toFixed(2)} cm` // 거리 수치를 그래프 위에 같이 띄움
  }
  else if (msg.destinationName == "temperate") { // 온도
    addChartData(1, parseFloat(msg.payloadString)); // 온도 그래프의 data 추가
    document.querySelector("#msg-temp").innerHTML = `온도 : ${Number(msg.payloadString).toFixed(2)} ℃` // 온도 수치를 그래프 위에 같이 띄움
  }
  else if (msg.destinationName == "humidity") { // 습도
    addChartData(2, parseFloat(msg.payloadString)); // 습도 그래프의 data 추가
    document.querySelector("#msg-humidity").innerHTML = `습도 : ${Number(msg.payloadString).toFixed(2)} %` // 습도 수치를 그래프 위에 같이 띄움
  }
  else if (msg.destinationName == "image") { // 영상
    console.log("image received")
    drawImage(msg.payloadBytes); // 메시지에 담긴 파일 이름으로 drawImage() 호출. drawImage()는 웹 페이지에 있음
  }
  else if (msg.destinationName == "moving") { // 움직임 메시지
    let newMsg = document.createElement('div');
    // 움직임 감지 메시지 chatBox에 출력
    const timeFormat = timeStamp();
    newMsg.textContent = `${timeFormat}` + ` ${msg.payloadString}`;
    chatBox.appendChild(newMsg);
    chatBoxCheck();
  }
  else if (msg.destinationName == "flagTemp") { // 온도 자동 제어 여부
    flagTemp = JSON.parse(msg.payloadString.toLowerCase()) // 현재 온도 자동 제어 여부 설정
    document.querySelector("#auto-control-temp-switch").checked = flagTemp // 온도 자동 제어 여부에 따른 체크 박스 표시
  }
  else if (msg.destinationName == "flagHumidity") { // 습도 자동 제어 여부
    flagHumidity = JSON.parse(msg.payloadString.toLowerCase()) // 현재 습도 자동 제어 여부 설정
    document.querySelector("#auto-control-humidity-switch").checked = flagHumidity // 습도 자동 제어 여부 따른 체크 박스 표시
  }
  else if (msg.destinationName == "setedTemp") { // 현재 설정 온도
    document.querySelector("#current-seted-temp").innerText = `현재 설정: ${Number(msg.payloadString)}℃` // 현재 설정 온도 출력
  }
  else if (msg.destinationName == "setedHumidity") { // 현재 설정 습도
    document.querySelector("#current-seted-humidity").innerText = `현재 설정: ${Number(msg.payloadString)}%` // 현재 설정 습도 출력
  }
}

// disconnection 함수
function disconnect() {
  if (connectionFlag == false)
    return; // 연결 되지 않은 상태이면 그냥 리턴
  for (let i = 0; i < topics.length; i++) { // 구독 했던 모든 토픽 구독 취소
    unsubscribe(topics[i])
  }
  stopCamera() // 카메라 수신 종료
  client.disconnect(); // 브로커와 접속 해제

  // 연결 종료 메시지 chatBox에 출력
  let newMsg = document.createElement('div');
  const timeFormat = timeStamp();
  newMsg.textContent = `${timeFormat}` + ' 연결종료';
  chatBox.appendChild(newMsg);
  chatBoxCheck();
  connectionFlag = false; // 연결 되지 않은 상태로 설정
}

const autoToggle = (box) => { // 자동 제어 메시지 전송 함수
  if (box == document.querySelector("#auto-control-temp-switch")) { // 온도 자동 제어 스위치 이면
    if (box.checked == true && flagTemp == false) { // 온도 자동 제어가 꺼져있고 웹에서 온도 자동 제어를 켜면
      publish("flag", "temp") // 온도 자동 제어 메시지 송신
    }
    else if (box.checked == false && flagTemp == true) { // 온도 자동 제어가 켜져있고 웹에서 온도 자동 제어를 끄면
      publish("flag", "temp") // 온도 자동 제어 메시지 송신
    }
  }
  else if (box == document.querySelector("#auto-control-humidity-switch")) { // 습도 자동 제어 스위치 이면
    if (box.checked == true && flagHumidity == false) { // 습도 자동 제어가 꺼져있고 웹에서 습도 자동 제어를 켜면
      publish("flag", "humidity") // 습도 자동 제어 메시지 송신
    }
    else if (box.checked == false && flagHumidity == true) { // 습도 자동 제어가 켜져있고 웹에서 습도 자동 제어를 끄면
      publish("flag", "humidity") // 습도 자동 제어 메시지 송신
    }
  }
}

const connectToggle = (box) => { // 커넥트 토글 스위치
  if (box.checked == true) { // 스위치를 켜면
    connect();
  }
  else { // 스위치를 끄면
    disconnect();
  }
}

const setAuto = (type) => { // 온도 및 습도 설정
  if (type == "temp") { // 온도 설정
    publish("setTemp", document.querySelector("#setTemp").value)
  }
  else if (type == "humidity") { // 습도 설정
    publish("setHumidity", document.querySelector("#setHumidity").value)
  }
} 
