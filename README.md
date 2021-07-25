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
 