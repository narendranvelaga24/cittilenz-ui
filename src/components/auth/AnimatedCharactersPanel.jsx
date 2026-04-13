import { useEffect, useState } from "react";

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function pointerVector(mouseX, mouseY) {
  const width = window.innerWidth || 1;
  const height = window.innerHeight || 1;
  const vx = (mouseX / width) * 2 - 1;
  const vy = (mouseY / height) * 2 - 1;
  return { vx, vy };
}

function Pupil({ size = 12, maxDistance = 5, pupilColor = "#2D2D2D", forceLookX, forceLookY, mouseX, mouseY }) {
  const { vx, vy } = pointerVector(mouseX, mouseY);
  const posX = forceLookX ?? clamp(vx * maxDistance, -maxDistance, maxDistance);
  const posY = forceLookY ?? clamp(vy * maxDistance, -maxDistance, maxDistance);

  return (
    <div
      className="auth-pupil"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: pupilColor,
        transform: `translate(${posX}px, ${posY}px)`,
      }}
    />
  );
}

function EyeBall({ size = 48, pupilSize = 16, maxDistance = 10, eyeColor = "#FFFFFF", pupilColor = "#2D2D2D", isBlinking = false, forceLookX, forceLookY, mouseX, mouseY }) {
  const { vx, vy } = pointerVector(mouseX, mouseY);
  const posX = forceLookX ?? clamp(vx * maxDistance, -maxDistance, maxDistance);
  const posY = forceLookY ?? clamp(vy * maxDistance, -maxDistance, maxDistance);

  return (
    <div
      className="auth-eye"
      style={{
        width: `${size}px`,
        height: isBlinking ? "2px" : `${size}px`,
        backgroundColor: eyeColor,
      }}
    >
      {!isBlinking && (
        <div
          className="auth-pupil"
          style={{
            width: `${pupilSize}px`,
            height: `${pupilSize}px`,
            backgroundColor: pupilColor,
            transform: `translate(${posX}px, ${posY}px)`,
          }}
        />
      )}
    </div>
  );
}

export function AnimatedCharactersPanel({ showPassword = false, passwordLength = 0, isTyping = false }) {
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);
  const [isPurpleBlinking, setIsPurpleBlinking] = useState(false);
  const [isBlackBlinking, setIsBlackBlinking] = useState(false);

  useEffect(() => {
    const handleMouseMove = (event) => {
      setMouseX(event.clientX);
      setMouseY(event.clientY);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    const blinkPurple = window.setInterval(() => {
      setIsPurpleBlinking(true);
      window.setTimeout(() => setIsPurpleBlinking(false), 150);
    }, 5000);

    const blinkBlack = window.setInterval(() => {
      setIsBlackBlinking(true);
      window.setTimeout(() => setIsBlackBlinking(false), 150);
    }, 6200);

    return () => {
      window.clearInterval(blinkPurple);
      window.clearInterval(blinkBlack);
    };
  }, []);

  const isLookingAtEachOther = isTyping;
  const isPurplePeeking = passwordLength > 0 && showPassword;

  const { vx, vy } = pointerVector(mouseX, mouseY);
  const faceX = clamp(vx * 15, -15, 15);
  const faceY = clamp(vy * 10, -10, 10);
  const bodySkew = clamp(-vx * 6, -6, 6);

  return (
    <div className="auth-illustration-wrap">
      <div className="auth-illustration-stage">
        <div className="auth-figure-canvas">
          <div
            className="auth-figure purple"
            style={{
              left: "70px",
              width: "180px",
              height: isTyping || (passwordLength > 0 && !showPassword) ? "440px" : "400px",
              transform:
                passwordLength > 0 && showPassword
                  ? "skewX(0deg)"
                  : isTyping || (passwordLength > 0 && !showPassword)
                    ? `skewX(${bodySkew - 12}deg) translateX(40px)`
                    : `skewX(${bodySkew}deg)`,
            }}
          >
            <div
              className="auth-eyes-row"
              style={{
                left:
                  passwordLength > 0 && showPassword
                    ? "20px"
                    : isLookingAtEachOther
                      ? "55px"
                      : `${45 + faceX}px`,
                top:
                  passwordLength > 0 && showPassword
                    ? "35px"
                    : isLookingAtEachOther
                      ? "65px"
                      : `${40 + faceY}px`,
              }}
            >
              <EyeBall
                size={18}
                pupilSize={7}
                maxDistance={5}
                isBlinking={isPurpleBlinking}
                forceLookX={passwordLength > 0 && showPassword ? (isPurplePeeking ? 4 : -4) : isLookingAtEachOther ? 3 : undefined}
                forceLookY={passwordLength > 0 && showPassword ? (isPurplePeeking ? 5 : -4) : isLookingAtEachOther ? 4 : undefined}
                mouseX={mouseX}
                mouseY={mouseY}
              />
              <EyeBall
                size={18}
                pupilSize={7}
                maxDistance={5}
                isBlinking={isPurpleBlinking}
                forceLookX={passwordLength > 0 && showPassword ? (isPurplePeeking ? 4 : -4) : isLookingAtEachOther ? 3 : undefined}
                forceLookY={passwordLength > 0 && showPassword ? (isPurplePeeking ? 5 : -4) : isLookingAtEachOther ? 4 : undefined}
                mouseX={mouseX}
                mouseY={mouseY}
              />
            </div>
          </div>

          <div
            className="auth-figure black"
            style={{
              left: "240px",
              width: "120px",
              height: "310px",
              transform:
                passwordLength > 0 && showPassword
                  ? "skewX(0deg)"
                  : isLookingAtEachOther
                    ? `skewX(${bodySkew * 1.5 + 10}deg) translateX(20px)`
                    : isTyping || (passwordLength > 0 && !showPassword)
                      ? `skewX(${bodySkew * 1.5}deg)`
                      : `skewX(${bodySkew}deg)`,
            }}
          >
            <div
              className="auth-eyes-row auth-eyes-row-black"
              style={{
                left:
                  passwordLength > 0 && showPassword
                    ? "10px"
                    : isLookingAtEachOther
                      ? "32px"
                      : `${26 + faceX}px`,
                top:
                  passwordLength > 0 && showPassword
                    ? "28px"
                    : isLookingAtEachOther
                      ? "12px"
                      : `${32 + faceY}px`,
              }}
            >
              <EyeBall
                size={16}
                pupilSize={6}
                maxDistance={4}
                isBlinking={isBlackBlinking}
                forceLookX={passwordLength > 0 && showPassword ? -4 : isLookingAtEachOther ? 0 : undefined}
                forceLookY={passwordLength > 0 && showPassword ? -4 : isLookingAtEachOther ? -4 : undefined}
                mouseX={mouseX}
                mouseY={mouseY}
              />
              <EyeBall
                size={16}
                pupilSize={6}
                maxDistance={4}
                isBlinking={isBlackBlinking}
                forceLookX={passwordLength > 0 && showPassword ? -4 : isLookingAtEachOther ? 0 : undefined}
                forceLookY={passwordLength > 0 && showPassword ? -4 : isLookingAtEachOther ? -4 : undefined}
                mouseX={mouseX}
                mouseY={mouseY}
              />
            </div>
          </div>

          <div
            className="auth-figure orange"
            style={{
              left: "0px",
              width: "240px",
              height: "200px",
              transform: passwordLength > 0 && showPassword ? "skewX(0deg)" : `skewX(${bodySkew}deg)`,
            }}
          >
            <div
              className="auth-eyes-row auth-eyes-row-orange"
              style={{
                left: passwordLength > 0 && showPassword ? "50px" : `${82 + faceX}px`,
                top: passwordLength > 0 && showPassword ? "85px" : `${90 + faceY}px`,
              }}
            >
              <Pupil size={12} maxDistance={5} forceLookX={passwordLength > 0 && showPassword ? -5 : undefined} forceLookY={passwordLength > 0 && showPassword ? -4 : undefined} mouseX={mouseX} mouseY={mouseY} />
              <Pupil size={12} maxDistance={5} forceLookX={passwordLength > 0 && showPassword ? -5 : undefined} forceLookY={passwordLength > 0 && showPassword ? -4 : undefined} mouseX={mouseX} mouseY={mouseY} />
            </div>
          </div>

          <div
            className="auth-figure yellow"
            style={{
              left: "310px",
              width: "140px",
              height: "230px",
              transform: passwordLength > 0 && showPassword ? "skewX(0deg)" : `skewX(${bodySkew}deg)`,
            }}
          >
            <div
              className="auth-eyes-row auth-eyes-row-yellow"
              style={{
                left: passwordLength > 0 && showPassword ? "20px" : `${52 + faceX}px`,
                top: passwordLength > 0 && showPassword ? "35px" : `${40 + faceY}px`,
              }}
            >
              <Pupil size={12} maxDistance={5} forceLookX={passwordLength > 0 && showPassword ? -5 : undefined} forceLookY={passwordLength > 0 && showPassword ? -4 : undefined} mouseX={mouseX} mouseY={mouseY} />
              <Pupil size={12} maxDistance={5} forceLookX={passwordLength > 0 && showPassword ? -5 : undefined} forceLookY={passwordLength > 0 && showPassword ? -4 : undefined} mouseX={mouseX} mouseY={mouseY} />
            </div>
            <div
              className="auth-mouth"
              style={{
                left: passwordLength > 0 && showPassword ? "10px" : `${40 + faceX}px`,
                top: passwordLength > 0 && showPassword ? "88px" : `${88 + faceY}px`,
              }}
            />
          </div>
        </div>
      </div>

      <div className="auth-illustration-grid" />
      <div className="auth-illustration-orb auth-illustration-orb-one" />
      <div className="auth-illustration-orb auth-illustration-orb-two" />
    </div>
  );
}