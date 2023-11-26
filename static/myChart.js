let ctx = [];
let chart = [];
let config = [
  {
    // type은 차트 종류 지정
    type: "line", // 라인그래프
    // data는 차트에 출력될 전체 데이터 표현
    data: {
      // labels는 배열로 데이터의 레이블들
      labels: [],
      // datasets 배열로 이 차트에 그려질 모든 데이터 셋 표현. 그래프 1개만 있음
      datasets: [
        {
          label: "거리",
          backgroundColor: "rgba(255, 165, 0, 0.5)",
          borderColor: "orange",
          borderWidth: 2,
          data: [], // 각 레이블에 해당하는 데이터
          fill: true, // 채우지 않고 그리기
        },
      ],
    },
    // 차트의 속성 지정
    options: {
      responsive: false, // 크기 조절 금지
      scales: {
        // x축과 y축 정보
        xAxes: [
          {
            display: true,
            scaleLabel: { display: true, labelString: "시간" },
          },
        ],
        yAxes: [
          {
            display: true,
            scaleLabel: { display: true, labelString: "거리" },
          },
        ],
      },
    },
  },
  {
    // type은 차트 종류 지정
    type: "line", // 라인그래프
    // data는 차트에 출력될 전체 데이터 표현
    data: {
      // labels는 배열로 데이터의 레이블들
      labels: [],
      // datasets 배열로 이 차트에 그려질 모든 데이터 셋 표현. 그래프 1개만 있음
      datasets: [
        {
          label: "온도",
          backgroundColor: "rgba(255, 0, 0, 0.5)",
          borderColor: "red",
          borderWidth: 2,
          data: [], // 각 레이블에 해당하는 데이터
          fill: true, // 채우지 않고 그리기
        },
      ],
    },
    // 차트의 속성 지정
    options: {
      responsive: false, // 크기 조절 금지
      scales: {
        // x축과 y축 정보
        xAxes: [
          {
            display: true,
            scaleLabel: { display: true, labelString: "시간" },
          },
        ],
        yAxes: [
          {
            display: true,
            scaleLabel: { display: true, labelString: "온도" },
          },
        ],
      },
    },
  }, {
    // type은 차트 종류 지정
    type: "line", // 라인그래프
    // data는 차트에 출력될 전체 데이터 표현
    data: {
      // labels는 배열로 데이터의 레이블들
      labels: [],
      // datasets 배열로 이 차트에 그려질 모든 데이터 셋 표현. 그래프 1개만 있음
      datasets: [
        {
          label: "습도",
          backgroundColor: "rgba(0, 0, 255, 0.5)",
          borderColor: "blue",
          borderWidth: 2,
          data: [], // 각 레이블에 해당하는 데이터
          fill: true, // 채우지 않고 그리기
        },
      ],
    },
    // 차트의 속성 지정
    options: {
      responsive: false, // 크기 조절 금지
      scales: {
        // x축과 y축 정보
        xAxes: [
          {
            display: true,
            scaleLabel: { display: true, labelString: "시간" },
          },
        ],
        yAxes: [
          {
            display: true,
            scaleLabel: { display: true, labelString: "습도" },
          },
        ],
      },
    },
  }
];
let LABEL_SIZE = 10; // 차트에 그려지는 데이터의 개수
let tick = []; // 도착한 데이터의 개수임, tick의 범위는 0에서 99까지만

function drawChart() {
  ctx[0] = document.getElementById("canvas-ultrasonic").getContext("2d");
  ctx[1] = document.getElementById("canvas-temp").getContext("2d");
  ctx[2] = document.getElementById("canvas-humidity").getContext("2d");
  for (let i = 0; i < ctx.length; i++) {
    chart[i] = new Chart(ctx[i], config[i]);
  }
  init();
}

function init() {
  // chart.data.labels의 크기를 LABEL_SIZE로 만들고 0~9까지 레이블 붙이기
  for (let j = 0; j < chart.length; j++) {
    for (let i = 0; i < LABEL_SIZE; i++) {
      chart[j].data.labels[i] = i;
    }
    chart[j].update();
    tick[j] = 0;
  }
}

function addChartData(chartNum, value) {
  let n = chart[chartNum].data.datasets[0].data.length; // 현재 데이터의 개수
  if (n < LABEL_SIZE)
    // 현재 데이터 개수가 LABEL_SIZE보다 작은 경우
    chart[chartNum].data.datasets[0].data.push(Number(value).toFixed(2));
  else {
    // 현재 데이터 개수가 LABEL_SIZE를 넘어서는 경우
    // 새 데이터 value 삽입
    chart[chartNum].data.datasets[0].data.push(Number(value).toFixed(2)); // value를 data[]의 맨 끝에 추가
    chart[chartNum].data.datasets[0].data.shift(); // data[]의 맨 앞에 있는 데이터 제거

    // 레이블 삽입
    chart[chartNum].data.labels.push(tick[chartNum]); // tick 값을 labels[]의 맨 끝에 추가
    chart[chartNum].data.labels.shift(); // labels[]의 맨 앞에 있는 값 제거
  }
  chart[chartNum].update();
  tick[chartNum]++;
  tick[chartNum] %= 100;
}

window.addEventListener("load", drawChart); // load 이벤트가 발생하면 drawChart() 호출하도록 등록
