document.addEventListener('DOMContentLoaded', () => {
    const inputCard = document.querySelector('.card');
    const waitingScreen = document.getElementById('waiting-screen');
    const submitBtn = document.getElementById('submit-btn');
    const backBtn = document.querySelector('.back-link');
    const backHomeBtn = document.querySelector('.back-home');

    const resultScreen = document.getElementById('result-screen');

    // 꽃 지식 베이스 로드
    let flowerData = [];
    fetch('src/data/flowers.json')
        .then(response => response.json())
        .then(data => {
            flowerData = data.flowers;
            console.log("🌸 꽃 지식 베이스가 로드되었습니다. (종 수: " + flowerData.length + ")");
        })
        .catch(err => console.error("데이터 로드 실패:", err));

    // 처방받기 버튼 클릭 시 (Input -> Waiting -> Result)
    submitBtn.addEventListener('click', () => {
        // 필수 필드 체크 (선택 사항)
        const story = document.getElementById('story-input').value;
        if (!story.trim()) {
            alert("상냥하게 당신의 이야기를 들려주세요. 😊");
            return;
        }

        inputCard.classList.add('hidden');
        waitingScreen.classList.remove('hidden');
        window.scrollTo(0, 0); // 화면 전환 시 상단으로 이동
        console.log("🌸 당신의 이야기를 분석 중입니다.");

        // 5초 후 결과 화면으로 전환 (시뮬레이션)
        setTimeout(() => {
            const matchedFlower = matchFlower(story);
            saveToLocalStorage(story, matchedFlower);
            renderResult(matchedFlower);

            waitingScreen.classList.add('hidden');
            resultScreen.classList.remove('hidden');
            window.scrollTo(0, 0);
            console.log("🌸 처방전 작성이 완료되었습니다.");
        }, 5000);
    });

    // 키워드 기반 매칭 엔진 (초안)
    function matchFlower(story) {
        // AI 연동 전까지 적용될 간단한 로직
        // 태그와 일치하는 단어가 가장 많은 꽃을 선택
        let bestMatch = flowerData[0]; // 기본값: 안개나무
        let maxScore = -1;

        flowerData.forEach(flower => {
            let score = 0;
            flower.tags.forEach(tag => {
                if (story.includes(tag)) score++;
            });
            if (score > maxScore) {
                maxScore = score;
                bestMatch = flower;
            }
        });
        return bestMatch;
    }

    // 결과 화면 렌더링
    function renderResult(flower) {
        document.getElementById('flower-name').innerText = flower.name;
        document.getElementById('flower-latin').innerText = flower.latinName;
        document.getElementById('result-flower-img').src = flower.imageUrl;

        // 편지 제목 및 내용 업데이트
        const titleEl = document.querySelector('.prescription-title');
        titleEl.innerHTML = `${flower.languageOfFlowers.split(',')[0]} 속에서 찾은 따뜻한 위로:<br>당신을 위한 ${flower.name}`;

        const contentEl = document.querySelector('.letter-content');
        contentEl.innerHTML = `
            <p>"${flower.meaning.split('.')[0]}."</p>
            <p>${flower.meaning}</p>
        `;

        const dateEl = document.getElementById('current-date');
        const now = new Date();
        dateEl.innerText = now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    }

    // LocalStorage 저장
    function saveToLocalStorage(story, flower) {
        const prescription = {
            id: Date.now(),
            date: new Date().toISOString(),
            story: story,
            flower: flower
        };
        localStorage.setItem('last_prescription', JSON.stringify(prescription));

        let history = JSON.parse(localStorage.getItem('prescription_history') || '[]');
        history.unshift(prescription);
        localStorage.setItem('prescription_history', JSON.stringify(history.slice(0, 5))); // 최근 5건 유지
    }

    // 대기 화면에서 처음으로 돌아가기
    backBtn.addEventListener('click', () => {
        waitingScreen.classList.add('hidden');
        inputCard.classList.remove('hidden');
        window.scrollTo(0, 0);
    });

    // 결과 화면에서 처음으로 돌아가기
    backHomeBtn.addEventListener('click', () => {
        resultScreen.classList.add('hidden');
        inputCard.classList.remove('hidden');
        window.scrollTo(0, 0);
    });
});
