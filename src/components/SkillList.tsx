import React, { useState, useEffect, useRef } from 'react';
import Employee from '../objects/Employee';
import { Skill, SkillType } from '../objects/Skill';
import { useLocomotiveScroll } from '../LocomotiveScrollProvider';

const SkillModal = ({ skill, x, y, rotation, index, sideScrolling }) => {
    if (!skill) return null;

    const safeX = () => {
        const width = document.querySelector(`#skill-modal-${index}`)?.clientWidth ?? 0;
        if ((x - width / 2) > 0 && (x + width / 2 + 20) < window.innerWidth) return x;
        else if (x < width / 2 + 20) return width / 2;
        else return window.innerWidth - width / 2 - 20;
    }

    const safeY = () => {
        if (sideScrolling) {
            return -y + (document.querySelector(`#skill-modal-${index}`)?.clientHeight ?? 0)
                + (document.querySelector(`#wrap-container-${index}`)?.getBoundingClientRect().bottom ?? 0);
        }

        const extraHeight = ((document.querySelector(`#meet-us-description-${index}`)?.clientHeight ?? 0) - (document.querySelector(`#meet-us-details-${index}`)?.clientHeight ?? 0));
        return -y + (document.querySelector(`#skill-modal-${index}`)?.clientHeight ?? 0) 
            + (document.querySelector(`#meet-us-details-${index}`)?.getBoundingClientRect().bottom ?? 0) 
            + (extraHeight > 0 ? extraHeight / 2 : 0);
    }

    const getSkillText = (level) => {
        switch (level) {
            case 1:
                return "Minimal";
            case 2:
                return "Low";
            case 3:
                return "Medium";
            case 4:
                return "High";
            case 5:
                return "Master";
            default:
                return "N/A";
        }
    }

    const getColor = (index) => {
        const colors = [
            "#f3722c",
            "#f8961e",
            "#f9c74f",
            "#90be6d",
            "#34A073",
        ]
        return colors[index];
    }

    return (
        <div
            id={ `skill-modal-${index}` }
            key={index}
            className="modal-content vstack leading"
            style={{
                position: 'absolute',
                bottom: safeY(),
                left: safeX(),
                zIndex: 3,
                transform: `translate(-50%, 75%) rotate(${rotation}deg)`
            }}
        >
            <div className="hstack">
                <img
                    loading="lazy"
                    src={ `skills/${skill.image}` } 
                    alt={ `${skill.image} logo` }
                    className="skill-image-full" />
                <div className="vstack leading" style={{ margin: "0 0 0 5px" }}>
                    <h2 className="skill-name">{skill.name}</h2>
                    {
                        skill.getRelatedNames().length > 0 ? (
                            <h3 className="skill-related-names">with {skill.getRelatedNames()}</h3>
                        ) : null
                    }
                </div>
            </div>
            <div className="hstack space-between">
                <div className="vstack">
                    <div className="hstack space-between" style={{ marginTop: "10px", height: "min-content" }}>
                        <h5 className="skill-details">Skill</h5>
                        <h5 className="skill-details"><span className="bold">{ getSkillText(skill.level) }</span></h5>
                    </div>
                    <div className="hstack" style={{ margin: 0 }}>
                        {
                            (new Array(5)).fill(null).map((_, index) => (
                                <div key={index} className={ `${(skill.level - 1) < index ? "outline-dot" : "filled-dot"}` } style={ (skill.level - 1) < index ? {} : { backgroundColor: getColor(index) }} />
                            ))
                        }
                    </div>
                </div>

                <h5 className="skill-details" style={{ textAlign: "right" }}>{skill.getFieldExperience() ? "Field" : ""} Experience<br /><span className="bold">{skill.yearsExperience()} years</span></h5>
            </div>
        </div>
    );
};

const SkillList = ({ employee, index, sideScrolling }) => {
    const [selectedSkill, setSelectedSkill] = useState(null);
    const [isModalVisible, setModalVisible] = useState(false);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [modalPosition, setModalPosition] = useState({ x: 0, y: 0 });
    const [rotation, setRotation] = useState(0);
    const scrollRef = useLocomotiveScroll();
    const requestRef = useRef(null);

    const handleMouseMove = (event) => {
        setMousePosition({ x: event.clientX, y: event.clientY });
    };

    const updateModalPosition = () => {
        setModalPosition((prev) => {
            const dx = mousePosition.x - prev.x;
            const dy = mousePosition.y - prev.y;

            // Calculate rotation based on movement
            const distance = Math.sqrt(dx * dx + dy * dy);
            const maxRotation = 10; // Max rotation in degrees
            const rotationFactor = 0.06; // Adjust rotation sensitivity
            const positionFactor = 0.06; // Adjust position sensitivity

            const newRotation = Math.max(-maxRotation, Math.min(maxRotation, distance * rotationFactor * (dx > 0 ? 1 : -1)));

            setRotation((prevRotation) => prevRotation + (newRotation - prevRotation) * 0.1);

            return {
                x: prev.x + dx * positionFactor,
                y: prev.y + dy * positionFactor,
            };
        });
        requestRef.current = requestAnimationFrame(updateModalPosition);
    };

    useEffect(() => {
        window.addEventListener('mousemove', handleMouseMove);
        requestRef.current = requestAnimationFrame(updateModalPosition);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(requestRef.current);
        };
    }, [mousePosition]);

    const handleSkillHover = (skill) => {
        setSelectedSkill(skill);
        setModalVisible(true);
    };

    const handleSkillClick = (skill) => {
        setSelectedSkill(skill);
        setModalVisible(true);
    };

    const handleCloseModal = () => {
        setModalVisible(false);
    };

    const handleScroll = (e) => {
        handleCloseModal();

        const container = document.getElementById(`wrap-container-${index}`);
        if (!container) return;

        if (container.getBoundingClientRect().bottom < window.innerHeight && (container.getBoundingClientRect().top > window.innerHeight)) {
            const transformFactor = (window.innerHeight - container.getBoundingClientRect().top) / (window.innerHeight);

        }
    }

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.on('scroll', handleScroll);
        }

        return () => {
            if (scrollRef.current) {
                scrollRef.current.off('scroll', handleScroll);
            }
        };
    }, [scrollRef, scrollRef.current]);

    return (
        <>
            <div
                id={ `wrap-container-${index}` } 
                className="wrap-container" 
                style={ sideScrolling ? {
                    width: "calc(100% - 20px)",
                } : {
                    width: "50vw",
                    maxWidth: "488px",
                }}
            >
                {Skill.skillTypes.map((skillType, index) => (
                    <div key={index} style={{ display: employee.filterType(skillType).length > 0 ? "inherit" : "none"}}>
                        {employee.filterType(skillType).length > 0 ? (
                            <div className="vstack leading" key={index}>
                                <h5 className="skill-type">{skillType}</h5>
                                <div className="images-container">
                                    {employee.filterType(skillType).map((skill: Skill, index: number) =>
                                        skill.image ? (
                                            <img
                                                loading="lazy"
                                                src={`skills/${skill.image}`}
                                                alt={`${skill.name} logo`}
                                                key={index}
                                                className="skill-image animated"
                                                onMouseEnter={() => handleSkillHover(skill)}
                                                onMouseLeave={() => handleCloseModal()}
                                                onClick={() => handleSkillClick(skill)}
                                            />
                                        ) : null
                                    )}
                                </div>
                            </div>
                        ) : null}
                    </div>
                ))}
            </div>
            <div className="animated-quick" style={{ opacity: isModalVisible ? 1 : 0 }}>
                <SkillModal
                    skill={selectedSkill}
                    x={modalPosition.x}
                    y={modalPosition.y}
                    rotation={rotation}
                    index={index}
                    sideScrolling={sideScrolling}
                />
            </div>
        </>
    );
};

export { SkillList, SkillModal };
