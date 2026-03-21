import { useNavigate } from "react-router-dom";
import HeroImage from "../../assets/HeroImage.png";
function Hero() {
  const navigate = useNavigate(); 

  return (
    <div className="hero bg-base-200 min-h-screen">
      <div className="hero-content flex-col lg:flex-row-reverse">
        <img
          src={HeroImage}
          className="max-w-sm rounded-lg shadow-2xl"
          alt=""
        />
        <div>
          <h1 className="text-6xl font-extrabold tracking-tight leading-tight">
            Welcome <span className="text-primary">Curious Learner!</span>
          </h1>
          <p className="py-8 text-lg text-gray-600 leading-relaxed max-w-lg">
            Coursify empowers you to master any subject by harnessing AI to generate structured, engaging, and personalized courses.
          </p>
          <button className="btn btn-primary btn-lg px-8 shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all" onClick={() => navigate("/generatepage")}>
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
}

export default Hero;
