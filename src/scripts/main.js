// Gemini API 연동을 위한 설정 (사용자 API Key 필요)
// 보안을 위해 실제 서비스에서는 백엔드에서 처리하는 것이 좋으나, 교육/로컬 목적으로 프론트엔드 연동 지원
const API_KEY = "YOUR_GEMINI_API_KEY"; // 여기에 API 키를 입력하세요.

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

        // 5초 후 결과 화면으로 전환
        setTimeout(async () => {
            let matchedFlower = matchFlower(story);
            let aiLetter = null;

            // AI 연동 시도 (API KEY가 있을 때만)
            if (API_KEY !== "YOUR_GEMINI_API_KEY") {
                console.log("🤖 Gemini Pro가 당신의 이야기를 읽는 중...");
                aiLetter = await generateAILetter(story, matchedFlower);
            }

            saveToLocalStorage(story, matchedFlower, aiLetter);
            renderResult(matchedFlower, aiLetter);

            waitingScreen.classList.add('hidden');
            resultScreen.classList.remove('hidden');
            window.scrollTo(0, 0);
        }, 5000);
    });

    // Gemini API를 통한 편지 생성 로직
    async function generateAILetter(story, flower) {
        const PROMPT = `
            당신은 사람들의 마음을 따뜻하게 위로해주는 감성적인 조력자이자 Florist입니다. 
            하지만 '플로리스트'라고 자신을 소개하지는 마세요. 
            대신 사용자의 이름을 다정하게(예: 'OO님') 불러주며 친구처럼, 또는 멘토처럼 다가가세요.

            [사용자의 이야기]: ${story}
            [처방된 꽃]: ${flower.name} (꽃말: ${flower.languageOfFlowers})

            [지시사항]:
            1. 사용자의 이름을 다정하게 불러주며 시작하세요.
            2. 사용자가 겪고 있는 고민에 대해 진심으로 공감하고 어루만져 주세요.
            3. ${flower.name}의 특징이나 꽃말을 사용자의 삶의 상황과 시적으로 연결해 주세요.
            4. 마지막에는 "오늘 하루 고생 많았어요" 같은 따뜻한 격려와 간단한 행동 제안을 해주세요.
            5. 답변은 반드시 한국어로, 격식있으면서도 친근한 어조로 작성해 주세요.
            6. 결과는 오직 편지 본문 텍스트만 출력하세요.
        `;

        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${API_KEY}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: PROMPT }] }]
                })
            });
            const data = await response.json();
            return data.candidates[0].content.parts[0].text;
        } catch (error) {
            console.error("AI 편지 생성 실패:", error);
            return null;
        }
    }

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
    function renderResult(flower, aiLetter) {
        document.getElementById('flower-name').innerText = flower.name;
        document.getElementById('flower-latin').innerText = flower.latinName;
        document.getElementById('result-flower-img').src = flower.imageUrl;

        // 편지 제목 및 내용 업데이트
        const titleEl = document.querySelector('.prescription-title');
        titleEl.innerHTML = `${flower.languageOfFlowers.split(',')[0]} 속에서 찾은 따뜻한 위로:<br>당신을 위한 ${flower.name}`;

        const contentEl = document.querySelector('.letter-content');
        if (aiLetter) {
            // AI가 생성한 편지가 있을 경우 (줄바꿈 처리)
            contentEl.innerHTML = aiLetter.split('\n').map(line => `<p>${line}</p>`).join('');
        } else {
            // AI 연동 실패 시 기본 지식 베이스 문구 사용
            contentEl.innerHTML = `
                <p>"${flower.meaning.split('.')[0]}."</p>
                <p>${flower.meaning}</p>
            `;
        }

        const dateEl = document.getElementById('current-date');
        const now = new Date();
        dateEl.innerText = now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    }

    // LocalStorage 저장
    function saveToLocalStorage(story, flower, aiLetter) {
        const prescription = {
            id: Date.now(),
            date: new Date().toISOString(),
            story: story,
            flower: flower,
            letter: aiLetter
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
