import Step from "../step.model.js";


async function seed() {
  await Step.insertMany([
    
    {
      number: 1,
      color: "bg-primary text-white",
      title: "Sign Up & Login",
      description: "Users sign up and log in securely with authentication.",
    },
    {
      number: 2,
      color: "bg-success text-white",
      title: "Real-time Messaging",
      description: "Messages are sent instantly via Socket.IO technology.",
    },
    {
      number: 3,
      color: "bg-warning text-dark",
      title: "Peer-to-Peer Calls",
      description: "WebRTC enables direct peer-to-peer calling with signaling.",
    },
    {
      number: 4,
      color: "bg-danger text-white",
      title: "Cloud Storage",
      description: "Media and files are securely stored in the cloud.",
    },
  ]);

  console.log("Steps added!");
  process.exit();
}

seed();
