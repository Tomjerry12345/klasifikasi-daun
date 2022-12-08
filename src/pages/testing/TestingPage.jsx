import TestingLogic from "./TestingLogic";

const TestingPage = () => {
  const logic = TestingLogic();

  return (
    <>
      <h1 style={{ paddingLeft: 4 }}>Mnist Clasification</h1>
      <canvas ref={logic.ref} width="300" height="300" />
    </>
  );
};

export default TestingPage;
