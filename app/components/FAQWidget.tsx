import { useState } from "react";
import styled from "styled-components";

interface FAQWidgetProps {
  title: string;
  description: string;
}

const FAQWidget: React.FC<FAQWidgetProps> = ({ title, description }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleIsOpen = () => setIsOpen(!isOpen);

  return (
    <FAQContainer>
      <FAQButton onClick={toggleIsOpen}>
        <FAQButtonCircle />
        {title}
      </FAQButton>
      {isOpen && (
        <FAQDescriptionContainer>{description}</FAQDescriptionContainer>
      )}
    </FAQContainer>
  );
};

const FAQContainer = styled.div`
  width: 896px;
  margin-bottom: 12px;
`;

const FAQButton = styled.button`
  display: flex;
  align-items: center;
  width: 100%;
  background-color: rgb(23, 53, 66);
  border: none;
  height: 40px;
  color: #ffffff;
  cursor: pointer;
  font-family: "GT America CM";
  text-transform: uppercase;
  font-size: 18px;
  letter-spacing: 0.49px;
`;

const FAQButtonCircle = styled.div`
  height: 20px;
  width: 20px;
  background-color: #a61776;
  border-radius: 50%;
  margin-left: 16px;
  margin-right: 16px;
`;

const FAQDescriptionContainer = styled.div`
  width: 100%;
  padding: 8px;
  background-color: rgba(25, 53, 67, 0.68);
  font-family: "Inter", sans-serif;
  font-size: 16px;
  letter-spacing: 0.43px;
  color: #ffffff;
`;

export default FAQWidget;
