let savedComments = [];
if (typeof window !== 'undefined') {
  const stored = localStorage.getItem('recipes-comments');
  if (stored) {
    try {
      savedComments = JSON.parse(stored);
    } catch (e) {
      savedComments = [];
    }
  }
}

let comments = $state(savedComments);


export const commentState = {
 get comments() {
    return comments;
  },

  
  get count() {
    return this.comments.length;
  },
  
  addComment(text) {
   comments.push(text);
    if (typeof window !== 'undefined') {
      localStorage.setItem('recipes-comments', JSON.stringify(comments));
    }
  }
};