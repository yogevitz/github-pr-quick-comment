// Define predefined comments
const comments = ["#skipreview", "#rebuild", "Looks good to me!", "Nice!"];

// Function to add comment to PR and submit
async function addCommentToPR(commentText) {
  const commentBox = document.querySelector('#new_comment_field');
  const xpathResult = document.evaluate("//button[contains(text(), 'Comment')]", document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
  const submitButton = xpathResult.snapshotItem(xpathResult.snapshotLength - 1);

  if (commentBox) {
    // Set the comment text and trigger events to simulate typing and enable the submit button
    commentBox.focus();
    commentBox.value = commentText;
    commentBox.dispatchEvent(new Event('input', { bubbles: true }));
    commentBox.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true }));
    commentBox.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true }));

    // Wait for the comment box to be updated and the submit button to become active
    await new Promise(resolve => setTimeout(resolve, 300)); // Short delay for GitHub to process input

    if (submitButton && !submitButton.disabled) {
      submitButton.click();  // Click the submit button
    }
  }
}

// Function to insert dropdown button
function insertDropdownButton() {
  const header = document.querySelector('.gh-header-actions');
  if (!header || header.querySelector('#comment-dropdown-button')) return;

  // Create the button with chevron
  const dropdownButton = document.createElement('button');
  dropdownButton.id = 'comment-dropdown-button';
  dropdownButton.innerHTML = 'Add Comment <span class="dropdown-caret"></span>';  // Chevron here
  dropdownButton.classList.add('btn', 'btn-sm', 'btn-primary');

  // Detect GitHub theme based on the <html> attribute
  const isGitHubDarkMode = document.documentElement.getAttribute('data-color-mode') === 'dark';

  // Create wrapper container for proper positioning
  const wrapper = document.createElement('div');
  wrapper.style.position = 'relative';
  wrapper.style.display = 'inline-block';
  wrapper.style.marginLeft = '8px';

  // Create dropdown menu
  const dropdownMenu = document.createElement('div');
  dropdownMenu.classList.add('dropdown-menu');
  dropdownMenu.style.position = 'absolute';
  dropdownMenu.style.top = '100%';
  dropdownMenu.style.left = '0';
  dropdownMenu.style.marginTop = '4px';
  dropdownMenu.style.display = 'none';
  dropdownMenu.style.padding = '4px 0';
  dropdownMenu.style.width = '200px';
  dropdownMenu.style.zIndex = '1000';
  dropdownMenu.style.borderRadius = '6px';

  // Apply light or dark mode styles
  if (isGitHubDarkMode) {
    dropdownMenu.style.backgroundColor = '#2d333b';
    dropdownMenu.style.border = '1px solid #444c56';
    dropdownMenu.style.color = '#f0f6fc';
    dropdownMenu.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.3)';
  } else {
    dropdownMenu.style.backgroundColor = '#ffffff';
    dropdownMenu.style.border = '1px solid #d1d5da';
    dropdownMenu.style.color = '#24292f';
    dropdownMenu.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.12)';
  }

  // Add each comment as an item in the dropdown
  comments.forEach((comment, index) => {
    const dropdownItem = document.createElement('div');
    dropdownItem.classList.add('dropdown-item');
    dropdownItem.innerText = comment;
    dropdownItem.style.padding = '8px 16px';
    dropdownItem.style.cursor = 'pointer';
    dropdownItem.style.fontSize = '14px';
    dropdownItem.style.borderRadius = '4px';

    // Apply styles specifically to the first dropdown item
    if (index === 0) {
      dropdownItem.classList.add('no-chevron'); // Add a special class to hide the chevron
    }

    // Apply GitHub-like hover effect
    dropdownItem.onmouseover = () => {
      dropdownItem.style.backgroundColor = isGitHubDarkMode ? '#444c56' : '#f3f4f6';
      dropdownItem.style.color = isGitHubDarkMode ? '#f0f6fc' : '#24292f';
    };
    dropdownItem.onmouseout = () => {
      dropdownItem.style.backgroundColor = isGitHubDarkMode ? '#2d333b' : '#ffffff';
      dropdownItem.style.color = isGitHubDarkMode ? '#f0f6fc' : '#24292f';
    };

    // Add comment and submit when item is clicked
    dropdownItem.onclick = async () => {
      await addCommentToPR(comment);  // Add and submit the comment immediately
      dropdownMenu.style.display = 'none';  // Close the dropdown
    };

    dropdownMenu.appendChild(dropdownItem);
  });

  // Toggle dropdown visibility
  dropdownButton.onclick = (e) => {
    e.stopPropagation();
    dropdownMenu.style.display = dropdownMenu.style.display === 'none' ? 'block' : 'none';
  };

  // Hide dropdown when clicking outside
  document.addEventListener('click', () => {
    dropdownMenu.style.display = 'none';
  });

  // Insert button and dropdown into wrapper, then append wrapper to header
  wrapper.appendChild(dropdownButton);
  wrapper.appendChild(dropdownMenu);
  header.appendChild(wrapper);
}

// Observe DOM changes to handle dynamic GitHub loading
const observer = new MutationObserver(() => {
  if (document.querySelector('.gh-header-actions')) {
    insertDropdownButton();
  }
});

observer.observe(document.body, { childList: true, subtree: true });