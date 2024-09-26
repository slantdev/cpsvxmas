// Set up the stage and layer
const stage = new Konva.Stage({
  container: "tree-canvas", // ID of the container from the HTML
  width: 500,
  height: 600,
});

const layer = new Konva.Layer();
stage.add(layer);

// Draw a simple triangle to represent the tree
const tree = new Konva.RegularPolygon({
  x: stage.width() / 2,
  y: 200,
  sides: 3,
  radius: 150,
  fill: "#3CB371", // Tree color
  stroke: "black",
  strokeWidth: 2,
  draggable: false,
});

layer.add(tree);

// Function to create ornaments
function createOrnament(x, y, color) {
  const ornament = new Konva.Circle({
    x: x,
    y: y,
    radius: 10,
    fill: color,
    stroke: "white",
    strokeWidth: 2,
    draggable: false,
  });

  // Add click event to show the form
  ornament.on("click", () => {
    showModal();
  });

  layer.add(ornament);
}

// Add ornaments to the tree (example positions)
createOrnament(230, 300, "#FF6347"); // red ornament
createOrnament(270, 340, "#FFD700"); // yellow ornament
createOrnament(200, 380, "#1E90FF"); // blue ornament
createOrnament(300, 400, "#ADFF2F"); // green ornament
createOrnament(250, 450, "#EE82EE"); // violet ornament

layer.draw();

// Modal control functions
const modal = document.getElementById("wish-modal");
const closeButton = document.querySelector(".close-button");

// Show the modal
function showModal() {
  modal.style.display = "block";
}

// Close the modal
closeButton.onclick = function () {
  modal.style.display = "none";
};

// Close the modal when clicking outside of it
window.onclick = function (event) {
  if (event.target === modal) {
    modal.style.display = "none";
  }
};

// Form submission handler
document.getElementById("wish-form").onsubmit = async function (event) {
  event.preventDefault();

  const wishText = document.getElementById("wish-text").value.trim();
  const donorName = document.getElementById("donor-name").value.trim();

  if (wishText) {
    try {
      // Add wish to Firestore
      await db.collection("wishes").add({
        text: wishText,
        name: donorName || "Anonymous", // Default to Anonymous if no name is given
        timestamp: new Date(),
      });

      alert("Your wish has been submitted!");
    } catch (error) {
      console.error("Error writing to Firestore:", error);
      alert("Failed to submit your wish. Please try again later.");
    }

    // Reset form and close modal
    document.getElementById("wish-form").reset();
    modal.style.display = "none";
  } else {
    alert("Please enter a wish before submitting.");
  }
};

// Function to listen to Firestore updates and display wishes in real-time
// Modify the Firestore query to limit the number of wishes
function loadWishes() {
  db.collection("wishes")
    .orderBy("timestamp", "desc")
    .limit(20) // Adjust this number based on your needs
    .onSnapshot((snapshot) => {
      // Clear existing ornaments before adding new ones
      layer.find(".ornament").forEach((ornament) => ornament.destroy());

      snapshot.forEach((doc) => {
        const wish = doc.data();
        createWishOrnament(wish.text, wish.name);
      });

      layer.draw();
    });
}

// Call the loadWishes function to start listening for updates
loadWishes();

// Function to create ornaments with hover effects
function createWishOrnament(wishText, donorName) {
  const randomX = Math.random() * (stage.width() - 60) + 30;
  const randomY = Math.random() * (stage.height() - 100) + 50;
  const colorArray = ["#FF6347", "#FFD700", "#1E90FF", "#ADFF2F", "#EE82EE"];
  const randomColor = colorArray[Math.floor(Math.random() * colorArray.length)];

  // Create the ornament
  const ornament = new Konva.Circle({
    x: randomX,
    y: randomY,
    radius: 15,
    fill: randomColor,
    stroke: "white",
    strokeWidth: 2,
    draggable: false,
    name: "ornament",
  });

  // Create the wish text label
  const text = new Konva.Text({
    x: randomX - 30,
    y: randomY + 20,
    text: `"${wishText}"\n- ${donorName}`,
    fontSize: 12,
    fontFamily: "Calibri",
    fill: "black",
    align: "center",
    width: 60,
    visible: false, // Initially hidden
  });

  // Add hover effects to show text and change ornament style
  ornament.on("mouseover", () => {
    ornament.stroke("gold");
    ornament.strokeWidth(4);
    text.visible(true);
    layer.draw();
  });

  ornament.on("mouseout", () => {
    ornament.stroke("white");
    ornament.strokeWidth(2);
    text.visible(false);
    layer.draw();
  });

  // Add the ornament and text to the layer
  layer.add(ornament);
  layer.add(text);
}

// Call the loadWishes function when the page loads to display existing wishes
loadWishes();
