import led

led_red = 13  # 수분
led_yellow = 19  # 먹이
led_green = 26  # 조명
led_on = 1
led_off = 0

setedTemp = 26 # 설정 온도
setedHumidity = 60 # 설정 습도

def controlLightBaseTemp(temperate):
    if temperate < setedTemp: # 관측 온도가 설정 온도 보다 낮으면
        led.controlLED(led_green, led_on)  # LED를 켜거나 끔
    else:
        led.controlLED(led_green, led_off)  # LED를 켜거나 끔

def controlWaterBaseHumidity(humidity): # 관측 습도가 설정 습도보다 낮으면
    if humidity < setedHumidity:
        led.controlLED(led_red, led_on)  # LED를 켜거나 끔
    else:
        led.controlLED(led_red, led_off)  # LED를 켜거나 끔