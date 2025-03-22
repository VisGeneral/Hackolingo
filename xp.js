const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const { getUserLanguages, headers, removeQuotes } = require('./helper.js');

const init = async () => {
    const token = removeQuotes(process.env.token);
    const userId = removeQuotes(process.env.userId);

    if (!token || !userId) {
        throw new Error('User ID and token must be specified.');
    }

    try {
        const userLanguages = await getUserLanguages();
        console.log('Fetched User Languages:', userLanguages);

        const sessionBody = {
            challengeTypes: [
                "assist", "characterIntro", "characterMatch", "characterPuzzle", "characterSelect", "characterTrace", "characterWrite",
                "completeReverseTranslation", "definition", "dialogue", "extendedMatch", "extendedListenMatch", "form", "freeResponse",
                "gapFill", "judge", "listen", "listenComplete", "listenMatch", "match", "name", "listenComprehension", "listenIsolation",
                "listenSpeak", "listenTap", "orderTapComplete", "partialListen", "partialReverseTranslate", "patternTapComplete",
                "radioBinary", "radioImageSelect", "radioListenMatch", "radioListenRecognize", "radioSelect", "readComprehension",
                "reverseAssist", "sameDifferent", "select", "selectPronunciation", "selectTranscription", "svgPuzzle", "syllableTap",
                "syllableListenTap", "speak", "tapCloze", "tapClozeTable", "tapComplete", "tapCompleteTable", "tapDescribe",
                "translate", "transliterate", "transliterationAssist", "typeCloze", "typeClozeTable", "typeComplete", "typeCompleteTable",
                "writeComprehension"
            ],
            fromLanguage: userLanguages.fromLanguage,
            isFinalLevel: true,
            isV2: true,
            juicy: true,
            learningLanguage: userLanguages.learningLanguage,
            levelIndex: 0,
            shakeToReportEnabled: true,
            skillId: "ae1fb2880c703e80f82b6b7227b3d1b2",
            smartTipsVersion: 2,
            type: "LEGENDARY_LEVEL",
        };

        // Randomly choose a daily XP target between 2000 and 6000.
        const totalDailyXP = Math.floor(Math.random() * (6000 - 2000 + 1)) + 2000;
        console.log(`Total Daily XP target: ${totalDailyXP}`);

        let xpAccumulated = 0;
        let sessionCount = 0;

        while (xpAccumulated < totalDailyXP) {
            sessionCount++;
            const remainingXP = totalDailyXP - xpAccumulated;
            const maxSessionXP = Math.min(200, remainingXP);
            // Generate a random XP value between 1 and maxSessionXP (inclusive)
            const sessionXP = Math.floor(Math.random() * maxSessionXP) + 1;
            console.log(`Session ${sessionCount}: Awarding ${sessionXP} XP (remaining: ${remainingXP})`);

            try {
                // Create a new practice session
                const createdSession = await fetch("https://www.duolingo.com/2017-06-30/sessions", {
                    headers,
                    method: 'POST',
                    body: JSON.stringify(sessionBody),
                }).then(res => {
                    if (!res.ok) throw new Error('Failed to create session. Check your credentials.');
                    return res.json();
                });

                console.log(`Created Fake Duolingo Practice Session: ${createdSession.id}`);

                // Submit the session with the generated XP for this session
                const rewards = await fetch(`https://www.duolingo.com/2017-06-30/sessions/${createdSession.id}`, {
                    headers,
                    method: 'PUT',
                    body: JSON.stringify({
                        ...createdSession,
                        beginner: false,
                        challengeTimeTakenCutoff: 6000,
                        startTime: (Date.now() - 20 * 60 * 1000) / 1000,
                        enableBonusPoints: true,
                        endTime: Date.now() / 1000,
                        failed: false,
                        heartsLeft: 0,
                        hasBoost: true,
                        maxInLessonStreak: 17,
                        shouldLearnThings: true,
                        progressUpdates: [],
                        sessionExperimentRecord: [],
                        sessionStartExperiments: [],
                        showBestTranslationInGradingRibbon: true,
                        xpPromised: sessionXP,
                    }),
                }).then(res => {
                    if (!res.ok) {
                        return res.text().then(text => {
                            console.error(`Error receiving rewards: ${text}`);
                        });
                    }
                    return res.json();
                });

                console.log(`Submitted Spoof Practice Session Data - Received`);
                console.log(`Congratulations, you earned ${rewards.xpGain} XP in this session!`);

                xpAccumulated += sessionXP;
            } catch (err) {
                console.error(`Error in session ${sessionCount}: ${err}`);
            }
        }
        console.log(`Daily target achieved. Total XP accumulated: ${xpAccumulated} XP in ${sessionCount} sessions.`);
    } catch (err) {
        console.error(`Initialization failed: ${err}`);
    }
};

init();
