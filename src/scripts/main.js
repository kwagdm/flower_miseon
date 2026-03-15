const API_KEY = "AIzaSyBDhRPauXB_aZSVsBbvvp8vqHMwxbe4YfE".trim();

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
            try {
                let matchedFlower = matchFlower(story);
                let aiLetter = null;

                // AI 편지 생성 (이미지는 이미 flowers.json에 모두 있음)
                if (API_KEY !== "YOUR_GEMINI_API_KEY") {
                    aiLetter = await generateAILetter(story, matchedFlower);
                }

                saveToLocalStorage(story, matchedFlower, aiLetter);
                renderResult(matchedFlower, aiLetter);
            } catch (error) {
                console.error("처방 프로세스 중 오류 발생:", error);
                const fallbackFlower = flowerData[0] || { name: '안개나무', id: 'smoke-tree' };
                renderResult(fallbackFlower, null);
            } finally {
                waitingScreen.classList.add('hidden');
                resultScreen.classList.remove('hidden');
                window.scrollTo(0, 0);
            }
        }, 5000);
    });

    // Gemini API를 통한 편지 생성 로직
    async function generateAILetter(story, flower) {
        const PROMPT = `
            당신은 한 송이 꽃의 숨결로 마음을 치유하는 가장 섬세한 '마음 조력자(Florist)'입니다. 
            아래의 [작성 지침]과 [구조 레퍼런스]를 참고하여, 오직 **[사용자의 실제 이야기]**에만 기반한 위로의 편지를 작성해 주세요.

            [사용자의 실제 이야기]: ${story}
            [처방된 꽃]: ${flower.name} (꽃말: ${flower.languageOfFlowers})

            [작성 지침 - 절대 준수]:
            1. **마크다운 사용 금지**: 별표(**), 언더바(_) 등 모든 마크다운 서식 기호를 **절대** 사용하지 마십시오. 강조는 오직 <em class="highlight">텍스트</em> 태그만 사용해야 합니다.
            2. **도입부 정제**: "오늘 남겨주신..." 과 같은 상투적인 도입부로 시작하지 마세요. 바로 본론으로 들어가 사용자의 이야기에 깊이 공감하는 독창적인 첫 문장으로 시작하십시오. 
            3. **할루시네이션 금지**: 오직 **[사용자의 실제 이야기]**에 언급된 사실과 감정만을 사용하세요. 
            4. **서사 구조**: [배경 공감 -> 꽃 추천 -> 상황과 꽃의 물성 연결 -> 응원 -> 행동 제안]의 흐름을 지키세요.
            5. **익명의 품격**: 이름을 부르지 말고 '당신', '그대' 혹은 적절한 호칭을 사용하여 품격 있는 문체로 작성하세요.
            6. **단락 분리 필수**: 글이 길어 답답해 보이지 않도록, 의미가 넘어갈 때마다(공감 -> 추천 -> 의미 부여 -> 행동 제안) 반드시 줄바꿈(엔터)을 두 번 넣어 문단을 시원하게 나누어 주세요.

            [구조 레퍼런스 - 문체와 흐름만 참고하세요]:
            "그런 당신께 오늘 제가 고른 꽃은 <em class="highlight">안개나무</em>입니다.

            안개나무는... (꽃의 물성과 상황 연결)...

            당신의 내일이 <em class="highlight">희망의 내일</em>이 되기를 진심으로 응원합니다.
            
            오늘은 자신에게 '정말 애썼다'고 한마디만 해주세요."

            [주의]: "안녕하세요", "준비한 결과입니다", "[ ]" 등 불필요한 태그나 인사말 없이 오직 편지 본문 텍스트만 출력하세요.
        `;

        // 시도할 모델 후보군을 더 최신/안정적인 명칭으로 보강
        const modelsToTry = [bestModel, 'gemini-1.5-flash', 'gemini-1.5-flash-latest', 'gemini-1.5-pro', 'gemini-pro'];
        const uniqueModels = [...new Set(modelsToTry)];

        for (const model of uniqueModels) {
            const endpoints = [
                `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${API_KEY}`,
                `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`
            ];

            for (const url of endpoints) {
                try {
                    console.log(`🤖 AI 편지 작성을 시작합니다... (Model: ${model}, Version: ${url.includes('v1beta') ? 'v1beta' : 'v1'})`);
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
                        console.warn(`${model} (${url}) 시도 실패:`, err.error?.message || response.statusText);

                        // 403 Forbidden이면 키 권한 문제이므로 더 이상 시도하지 않음
                        if (response.status === 403) {
                            console.error("API 키 권한 오류입니다. 대시보드에서 API 활성화 여부를 확인해주세요.");
                            return null;
                        }
                    }
                } catch (error) {
                    console.error("API 호출 중 네트워크 오류:", error);
                }
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
        const MAGAZINE_HERO = document.querySelector('.magazine-hero');
        const flowerImg = document.getElementById('result-flower-img');
        const creditEl = document.querySelector('.photographer-credit');
        const photographerName = document.getElementById('photographer-name');

        // 1. 기본 정보 바인딩
        document.getElementById('flower-name').innerText = flower.name;
        document.getElementById('flower-latin').innerText = flower.latinName;

        // 2. 처방 번호 및 날짜 (복구)
        const prescNo = Math.floor(Math.random() * 9000) + 1000;
        const prescNoEl = document.querySelector('.prescription-no') || document.querySelector('.prescription-id');
        if (prescNoEl) prescNoEl.innerText = `PRESCRIPTION NO. ${prescNo}`;

        const dateEl = document.getElementById('current-date');
        const now = new Date();
        if (dateEl) {
            const options = { year: 'numeric', month: 'long', day: 'numeric' };
            dateEl.innerText = now.toLocaleDateString('en-US', options);
        }

        // 3. 이미지 결정 및 렌더링 (순수 로컬 데이터 기반)
        const finalImageUrl = flower.imageUrl;

        if (finalImageUrl && finalImageUrl.startsWith('http')) {
            flowerImg.src = finalImageUrl;
            MAGAZINE_HERO.style.display = 'block';
            resultScreen.classList.add('has-image');

            // 출처 표기 (로컬 데이터)
            if (flower.imagePhotographer) {
                photographerName.innerText = flower.imagePhotographer;
                creditEl.classList.remove('hidden');
            } else {
                creditEl.classList.add('hidden');
            }

            flowerImg.onerror = function () {
                console.warn(`${flower.name} 이미지 로드 실패 - 영역을 숨깁니다.`);
                MAGAZINE_HERO.style.display = 'none';
                resultScreen.classList.remove('has-image');
                this.onerror = null;
            };
        } else {
            console.log("검증된 이미지가 없어 텍스트 중심 레이아웃으로 전환합니다.");
            MAGAZINE_HERO.style.display = 'none';
            resultScreen.classList.remove('has-image');
        }

        // 4. 편지 제목 및 내용 업데이트
        const titleEl = document.querySelector('.prescription-title');
        titleEl.innerHTML = `오늘 당신을 향한<br>꽃의 한 마디: ${flower.name}`;

        const contentEl = document.querySelector('.letter-content');
        if (aiLetter) {
            // 마크다운 별표(*, **) 완전 제거 필터링
            const cleanLetter = aiLetter.replace(/\*/g, '').trim();
            contentEl.innerHTML = cleanLetter.split('\n').filter(p => p.trim()).map(line => `<p>${line}</p>`).join('');
        } else {
            contentEl.innerHTML = `
                <p>"오늘 남겨주신 당신의 마음의 소중한 조각들을 가만히 읽어보았습니다."</p>
                <p>${flower.meaning.replace('당신에게', '당신께').replace('응원을 보냅니다', '응원을 건넵니다')}</p>
                <p>지금 이 순간, ${flower.name}의 숨결이 당신의 마음 한구석에 작은 온기가 되기를 바랍니다.</p>
            `;
        }

        // 6. 감성적인 화면 전환 (Fade-in 효과)
        resultScreen.style.opacity = '0';
        resultScreen.classList.remove('hidden');

        // 강제 리플로우 후 투명도 조절로 애니메이션 유도
        setTimeout(() => {
            resultScreen.style.transition = 'opacity 1.5s ease-in-out';
            resultScreen.style.opacity = '1';
        }, 50);
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
