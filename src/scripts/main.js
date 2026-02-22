const API_KEY = "AIzaSyAY9ZT8WRxd6DOtTyeCNCd73_ncuUDlEbw".trim(); // 여기에 API 키를 입력하세요.

document.addEventListener('DOMContentLoaded', () => {
    const inputCard = document.querySelector('.card');
    const waitingScreen = document.getElementById('waiting-screen');
    const submitBtn = document.getElementById('submit-btn');
    const backBtn = document.querySelector('.back-link');
    const backHomeBtn = document.querySelector('.back-home');

    const resultScreen = document.getElementById('result-screen');

    // 가용 모델 리스트 확인 및 자동 선택 로직
    let bestModel = 'gemini-1.5-flash';
    async function initAI() {
        if (API_KEY === "YOUR_GEMINI_API_KEY") return;
        try {
            // v1 버전에서 가용 모델 확인
            const response = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${API_KEY}`);
            if (!response.ok) throw new Error("API Key might be invalid or restricted.");
            const data = await response.json();
            const modelNames = data.models?.map(m => m.name.replace('models/', '')) || [];
            console.log("🔍 가용 모델 리스트:", modelNames);

            // 실시간 사용 가능 모델 중 우선순위 높은 것 선택
            if (modelNames.includes('gemini-1.5-flash')) bestModel = 'gemini-1.5-flash';
            else if (modelNames.includes('gemini-1.5-pro')) bestModel = 'gemini-1.5-pro';
            else if (modelNames.length > 0) bestModel = modelNames[0];
        } catch (e) {
            console.error("AI 초기화 실패:", e.message);
        }
    }
    initAI();

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
            당신은 지친 마음을 꽃 한 송이로 어루만져 주는 따뜻하고 통찰력 있는 '마음 조력자'입니다. 
            사용자의 고민을 듣고, 10초의 침묵 끝에 건네는 가장 진심 어린 편지 한 통을 작성해 주세요.

            [사용자의 이야기]: ${story}
            [처방된 꽃]: ${flower.name} (꽃말: ${flower.languageOfFlowers})

            [지시사항 - 매우 중요]:
            1. 시작: 사용자의 이름을 다정하게 부르며 첫 인사를 건네세요. (예: 'OO님, 오늘 참 많이 애쓰셨죠?')
            2. 공감: 고민의 본질을 꿰뚫어 보되, 너저분하게 길지 않게 딱 2~3문장으로 깊이 공감해 주세요.
            3. 연결: ${flower.name}의 생태적 특징이나 꽃말을 사용자의 상황과 시적으로 연결해 위로의 메시지를 전하세요.
            4. 마무리: "오늘 밤은 아무 걱정 없이 푹 쉬었으면 좋겠어요"처럼 구체적이고 따뜻한 행동 제안으로 맺으세요.
            5. 분량 가이드: 기존의 긴 산문 형식보다, 여백의 미가 느껴지는 300자 내외의 정제된 편지여야 합니다. 
            6. 문단 사이에는 충분한 공백을 두어 한 호흡씩 읽을 수 있게 하세요.
            7. 답변은 오직 편지 본문 텍스트만 출력하세요. (인사말/설명 금지)
        `;

        // v1beta가 404를 낸다면 v1을 시도
        const endpoints = [
            `https://generativelanguage.googleapis.com/v1/models/${bestModel}:generateContent?key=${API_KEY}`,
            `https://generativelanguage.googleapis.com/v1beta/models/${bestModel}:generateContent?key=${API_KEY}`
        ];

        for (const url of endpoints) {
            try {
                console.log(`🤖 AI 편지 작성을 시작합니다... (Model: ${bestModel})`);
                const response = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: PROMPT }] }]
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
                        return data.candidates[0].content.parts[0].text;
                    }
                } else {
                    const err = await response.json();
                    console.warn(`URL 시도 실패 (${url}):`, err.error?.message);
                }
            } catch (error) {
                console.error("API 연동 오류:", error);
            }
        }
        return null;
    }

    // 키워드 기반 매칭 엔진 (다양성 강화)
    function matchFlower(story) {
        if (!flowerData || flowerData.length === 0) return null;

        // 1. 키워드 매칭 시도
        for (let flower of flowerData) {
            for (let tag of flower.tags) {
                if (story.includes(tag)) {
                    return flower;
                }
            }
        }

        // 2. 매칭되는 키워드 없을 시, 랜덤하게 추천하여 '안개나무' 고정 방지
        const randomIndex = Math.floor(Math.random() * flowerData.length);
        return flowerData[randomIndex];
    }

    // 결과 화면 렌더링
    function renderResult(flower, aiLetter) {
        document.getElementById('flower-name').innerText = flower.name;
        document.getElementById('flower-latin').innerText = flower.latinName;
        const flowerImg = document.getElementById('result-flower-img');
        flowerImg.src = flower.imageUrl;

        // 이미지 로드 실패 시 대비 (Fallback)
        flowerImg.onerror = function () {
            console.warn(`${flower.name} 이미지를 불러오지 못해 기본 이미지로 대체합니다.`);
            this.src = 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&q=80&w=1200'; // 부드러운 안개나무 이미지를 기본값으로 사용
            this.onerror = null; // 무한 루프 방지
        };

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
