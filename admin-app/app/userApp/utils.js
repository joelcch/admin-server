function extractMentionedStudents(notification) {
    const emailRegex = /@([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
    const mentionedStudents = [];
    let match;
    while ((match = emailRegex.exec(notification)) !== null) {
        mentionedStudents.push(match[1]); // match[1] contains the captured email address
    }
    return mentionedStudents;
}

export { extractMentionedStudents };