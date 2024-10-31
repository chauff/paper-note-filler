export const prompts = new Map<string, string>([
    [
        "generateTags",
        `Given a paper abstract and a list of hashtags I have used in the past
        to tag abstracts, select up to five relevant hashtags that best describe 
        the abstract. If none fit, return an empty string. Do not create new hashtags,
        only pick from the list of available hashtags. Return a list of hashtags in
        whitespace delimited form and nothing else.`
    ],
    [
        "futureWork",
        `Given the scientific paper below, succcinctly summarize the avenues for future
        work the authors discuss. No more than 3 sentences in total. Return nothing else.`
    ]
]);

