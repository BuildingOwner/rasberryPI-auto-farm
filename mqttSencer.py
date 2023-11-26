import time
import paho.mqtt.client as mqtt
import ultrasonic
import temp
import led
import autoControl

led_red = 13  # 수분
led_yellow = 19  # 먹이
led_green = 26  # 조명
led_on = 1
led_off = 0

autoFlagTemp = False  # 온도 자동제어 사용 여부
autoFlagHumidity = False  # 습도 자동제어 사용 여부


def on_connect(client, userdata, flag, rc):
    client.subscribe("led", qos=0)  # "led" 토픽으로 구독 신청
    client.subscribe("feed", qos=0)  # "feed" 토픽으로 구독 신청
    client.subscribe("water", qos=0)  # "water" 토픽으로 구독 신청
    client.subscribe("flag", qos=0)  # "flag" 토픽으로 구독 신청 / 자동 제어 사용 여부
    client.subscribe("setTemp", qos=0)  # "setTemp" 토픽으로 구독 신청 / 온도 설정
    client.subscribe("setHumidity", qos=0)  # "setHumidity" 토픽으로 구독 신청 / 습도 설정


def on_message(client, userdata, msg):
    print(msg.topic)
    if msg.topic == "led":  # 조명
        on_off = int(msg.payload)
        # on_off는 0 또는 1의 정수
        led.controlLED(led_green, on_off)  # LED를 켜거나 끔
    elif msg.topic == "feed":  # 먹이 주기
        on_off = int(msg.payload)
        led.controlLED(led_yellow, on_off)  # LED를 켬
        time.sleep(1)
        led.controlLED(led_yellow, led_off)  # 1초 후 LED를 끔
    elif msg.topic == "water":  # 가습
        on_off = int(msg.payload)
        led.controlLED(led_red, on_off)  # LED를 켜거나 끔
    elif msg.topic == "flag":  # 자동 제어 사용
        global autoFlagTemp
        global autoFlagHumidity
        print(msg.payload.decode("utf-8"))
        if msg.payload.decode("utf-8") == "temp":  # 온도 제어 사용
            autoFlagTemp = not autoFlagTemp
            if not autoFlagTemp:  # 온도 제어 사용이 꺼지면
                led.controlLED(led_green, led_off)  # 조명 led off
        elif msg.payload.decode("utf-8") == "humidity":  # 습도 제어 사용
            autoFlagHumidity = not autoFlagHumidity
            if not autoFlagHumidity:  # 습도 제어 사용이 꺼지면
                led.controlLED(led_red, led_off)  # 습도 led off
    elif msg.topic == "setTemp": # 자동 제어 온도 설정
        autoControl.setedTemp = int(msg.payload)
    elif msg.topic == "setHumidity": # 자동 제어 습도 설정
        autoControl.setedHumidity = int(msg.payload)


ip = "localhost"  # 현재 브로커는 이 컴퓨터에 설치되어 있음

client = mqtt.Client()
client.on_connect = on_connect
client.on_message = on_message

client.connect(ip, 1883)  # 브로커에 연결
client.loop_start()  # 메시지 루프를 실행하는 스레드 생성

prev_moving = 0  # 이전 관측 거리


while True:
    try:
        temperate = temp.getTemperature(temp.sensor)  # 온도 측정
        if autoFlagTemp: # 온도 자동 제어가 켜져 있으면
            autoControl.controlLightBaseTemp(temperate) # 온도에 따른 조명 제어

        humidity = temp.getHumidity(temp.sensor)  # 습도 측정
        if autoFlagHumidity: # 습도 자동 제어가 켜져 있으면
            autoControl.controlWaterBaseHumidity(humidity) # 습도에 따른 가습 제어

        distance = ultrasonic.measure_distance()  # 초음파 센서로부터 거리 읽기
        if int(distance) != prev_moving: # 이전 측정 거리와 현재 측정 거이가 다르면 움익임이 있는것으로 간주
            client.publish("moving", "반려동물의 움직임이 포착되었습니다.", qos=0)
        else:
            client.publish("moving", "반려동물의 움직임이 없습니다.", qos=0)
        prev_moving = int(distance)
        client.publish("ultrasonic", distance, qos=0)  # ultrasonic 토픽으로 거리 전송
        client.publish("temperate", temperate, qos=0)  # temperate 토픽으로 온도 전송
        client.publish("humidity", humidity, qos=0)  # humidity 토픽으로 습도 전송
        client.publish(
            "flagTemp", autoFlagTemp, qos=0
        )  # flagTemp 토픽으로 온도 자동제어 사용 여부 전송
        client.publish(
            "flagHumidity", autoFlagHumidity, qos=0
        )  # flagHumidity 토픽으로 습도 자동제어 사용 여부 전송
        client.publish(
            "setedTemp", autoControl.setedTemp, qos=0
        )  # setedTemp 토픽으로 현재 설정 온도 전송
        client.publish(
            "setedHumidity", autoControl.setedHumidity, qos=0
        )  # setedHumidity 토픽으로 현재 설정 습도 전송
        time.sleep(1)  # 1초 동안 잠자기
    except KeyboardInterrupt:
        break

# 프로그램 종료시 led 끔
led.controlLED(led_red, led_off)
led.controlLED(led_yellow, led_off)
led.controlLED(led_green, led_off)

client.loop_stop()  # 메시지 루프를 실행하는 스레드 종료
client.disconnect()
