# Backend Complexity

All of our backend code is within `app/api/` as we are using NextJS, and unfortunately you will not be able to run the backend code
because it will require a secret key for our services and ChatGPT however, you can still see their implementation. There are all called in moderation to interact with the database.

## Function Runtime Complexity

**O(1)** - saveAnswer, pathways, getCurrentNode, game, auth/new-user, aiAssistance.  
**O(n)** - stats, makePathwayQuiz, checkCorrectAnswers.

## Examples

1. `saveAnswer` in line 87 of `components/MCQ.tsx`

   - It needs to be called every single time the user answers a question so if the app crashes we can implement functionality to continue the quiz from where they crashed.

2. `stats` in line 101 `components/MCQ.tsx`

   - It needs to be called after the quiz is completed and needs to calculate all the stats.

3. `checkCorrectAnswers` in line 68 of `components/pathways/PathwayButtonRenderer.tsx`
   - It is only ever called if the current node of the learning pathway matches.
   - We could have made multiple API calls for every node, however, to reduce "spaghetti code" we made it so it only does it once if node matches.

Most of the post occur once just to retrieve information from the database.
