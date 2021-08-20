# light.io
Personal web game development based on dynamic.io


# Game Idea


- Goal : Panel에 각각 맞도록 색깔 설치
- 단순한 visibility area에 의한 수학 문제가 되지 않는 이유
- 1. 실제로는 가능하나 default 공 위치에 따라 불가능한 경우가 있을 수 있음
- 2. 다양한 object : Mirror, Portal, 지나갈 수 있지만 빛만 막는 것

VisibilityEdge issue -> Visibility Algorithm 아예 바꿈 / 정리는 되지 않았지만 장애물 만들 때 이음새만 잘 처리하면 사용가능
대신 edge 감지 불가... stable해져서 임의의 점 check는 쉽게 가능해짐

Panel 전체로 하기...

서로 만나는 선들 있으면 사전에 처리하기

polygon 최적화 -> edge 얻어내기 / 직선 뿐만 아니라 호도 얻어내기

Game 판 크기 달라져도 움직이는 절대 거리 기준 계산이라서 훨씬 빨리 움직일 수 있음 - grid 기준 좌표계 다시 설정? - 시야 바꿀 때도 도움될지도

Visualizer에서 panel 보이는 부분만 보이게 하는 것처럼 lamp 넣어서 광원 효과 넣기
light.js 같은 거 필요한가? - shadow.js 수정하면 될 듯

https://playcanvas.com/#!
https://developer.mozilla.org/en-US/docs/Web/API/Pointer_Lock_API

edge 두 개가 점에서 만날 때 오류 나는 경우가 존재 mapIntro , 가장 왼쪽 가장 아래에서 한 칸 위

대각선으로 panel 판단 넘어가는 오류 해결해야 함 - ----- TODOTODOTODO