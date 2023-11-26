import RPi.GPIO as GPIO


# LED를 켜고 끄는 함수
def controlLED(pin, on_off):  # led 번호의 핀에 on_off(0/1) 값 출력하는 함수
    GPIO.output(pin, on_off)


# LED를 다루기 위한 전역 변수 선언 및 초기화
led_green = 26  # GPI26
GPIO.setup(led_green, GPIO.OUT)  # GPI26 핀을 출력으로 지정
led_red = 13  # GPI13
GPIO.setup(led_red, GPIO.OUT)  # GPI13 핀을 출력으로 지정
led_yellow = 19  # GPI19
GPIO.setup(led_yellow, GPIO.OUT)  # GPI19 핀을 출력으로 지정
