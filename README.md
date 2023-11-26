# rasberryPI-auto-farm

### 작품 개요
이 프로젝트는 라즈베리파이를 이용하여 파충류를 효율적으로 관리하는 보조 모듈을 개발하는 것이다. 이 시스템을 통해 사용자는 편의성과 파충류의 건강을 동시에 챙기는 효율적인 파충류 관리를 할 수 있다.<br/><br/>
이 시스템은 온습도를 측정하고, 이를 통해 사육 환경 조건을 최적화하는데 사용된다. 환경 조건이 부적절할 경우, 시스템은 광량을 보충하거나 습도를 조절하여 파충류의 건강을 유지하는데 도움을 준다.<br/><br/>
이 시스템은 카메라를 통해 파충류의 상태를 실시간으로 모니터링하며, 이를 웹페이지에 전송하여 사용자가 언제든지 파충류의 상태를 확인할 수 있다. 또한, 사용자는 웹페이지를 통해 원격으로 급여, 조명, 수분 공급을 조절할 수 있다.<br/><br/>
또한, 초음파 센서를 이용하여 파충류의 움직임을 감지한다. 파충류의 움직임을 감지하여 시스템이 움직임 감지 및 미감지에 대한 메시지를 사용자에게 전송한다. 이를 통해 사용자는 파충류의 건강 상태를 실시간으로 확인하고 빠른 조치를 취할 수 있다.<br/><br/>

## 시스템 구조
<img width="100%" alt="시스템 구조도" src="https://github.com/BuildingOwner/rasberryPI-auto-farm/assets/106369213/f54a3821-64b7-45db-8293-21ba2ba7e45d">
<br/><br/>

## 회로도
<img width="100%" alt="회로도" src="https://github.com/BuildingOwner/rasberryPI-auto-farm/assets/106369213/69daf588-4b5d-43b1-aa17-4213b7e3dc89">

+ 초록색 Led는 조명 역할, 노란색 Led는 먹이 공급, 빨간색 Led는 수분 공급 역할을 대체한다. 
+ 초음파 센서로 움직임을 감지하여 웹페이지에 움직임 감지 및 미감지에 대한 메시지를 받을 수 있다.
+ 온습도 센서로 온도와 습도를 측정하여 조명과 수분을 공급한다.

## 모듈 설명
- 라즈베리 파이 센서 제어
  - temp.py - 온습도 센서들로 부터 값을 읽고 각각의 값을 전달해주는 모듈
  - ultrasonic.py - 초음파 센서로 거리를 측정하는 모듈
  - led.py - 조명의 켜고 끔을 제어하는 모듈
  - camera.py - 카메라로 영상을 촬영하는 모듈
  - autoControl.py - 전달받은 값을 통해 조명과 수분을 제어하는 모듈
  - mqttCamera.py - 카메라로부터 영상을 촬영하고 mqtt로 전송하는 모듈
  - mqttSencer.py - 센서로부터 값을 각각의 값을 관측하고 mqtt로 전송하는 모듈

- 웹페이지
  - app.py - 웹브라우저로부터 접속과 요청을 처리하는 플라스크 앱
  - templates/index.html - 카메라로부터 실시간 영상 시청과 급여, 수분 및 조명 제어가 가능하고, 센서로부터 관측된 값을 그래프로 보여주는 웹페이지
  - static/image.js - 로부터 받은 영상을 웹페이지에 띄워주는 모듈
  - static/mqttio.js - 웹페이지에서 mqtt의 전반적인 송수신 및 커넥션 제어를 하는 모듈
  - static/myChart.js - 차트를 그리는 모듈

## 실행 화면
![실행화면](https://github.com/BuildingOwner/rasberryPI-auto-farm/assets/106369213/d439d1f1-4299-4cc2-9f23-ab27805f02ee)
