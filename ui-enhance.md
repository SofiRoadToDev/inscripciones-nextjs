1. Optimize Numeric Keyboards
Currently, fields like DNI and Phone are using standard text inputs. On mobile, this forces the user to switch to the numeric keyboard manually.

Action: Change type="text" to type="tel" or type="number" with inputMode="numeric". This automatically opens the numeric keypad.
2. Auto-Capitalization for Names
Mobile keyboards often try to guess words or capitalize the first letter.

Action: For Last Name and First Name fields, ensure autoCapitalize="words" is set so the keyboard capitalizes each word, making typing faster.
3. Native Select Interfaces vs. Custom
Dropdowns on mobile can be tricky.

Observation: You are using radix-ui Selects. These look great but sometimes checking native implementation on mobile is smoother.
Suggestion: Keep your current Selects as they are accessible, but ensure the touch-action is optimized so scrolling inside them doesn't scroll the page.
4. Larger Tap Targets & Spacing
Observation: The buttons seem to have good padding (h-10, etc.).
Action: Ensure that complex fields like the "Same Address" checkbox in Tutors have a large enough click area. You already wrapped it in a container, which is great.
5. Floating Action or Sticky Headers
Suggestion: On long forms (like Tutors), users might lose context of where the "Next" button is. Making the "Previous/Next" buttons sticky at the bottom of the viewport on mobile only (sticky bottom-0) can help completion rates.
6. Health Form Simplification
Observation: The health form has multiple Textarea fields. Typing long text on mobile is tedious.
Suggestion: Add "Chips" or "Quick Select" buttons for common answers like "No", "None", "Does not apply" above the text areas. This allows users to fill the form with one tap if they are healthy.
