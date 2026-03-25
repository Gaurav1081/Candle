import React from 'react';
import styled from 'styled-components';
import { Flame } from 'lucide-react';

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center odyssey-gradient">
      <div className="text-center space-y-6">
        {/* CANDLE Logo */}
        <div className="flex items-center justify-center">
          <div className="flex aspect-square size-16 items-center justify-center rounded-lg candle-gradient text-white shadow-glow">
            <Flame className="size-8" />
          </div>
        </div>
        
        {/* Brand Name */}
        <div>
          <h1 className="text-3xl font-bold candle-text-gradient mb-2">CANDLE</h1>
          <p className="text-candle-muted-blue">Loading your dashboard...</p>
        </div>
        
        {/* Mario Loader */}
        <StyledWrapper>
          <div className="loader" />
        </StyledWrapper>
      </div>
    </div>
  );
}

const StyledWrapper = styled.div`
  .loader {
    width: fit-content;
    font-size: 17px;
    font-family: monospace;
    line-height: 1.4;
    font-weight: bold;
    padding: 30px 2px 50px;
    background: linear-gradient(#1F02F7 0 0) 0 0/100% 100% content-box padding-box no-repeat;
    position: relative;
    overflow: hidden;
    animation: l10-0 2s infinite cubic-bezier(1, 175, 0.5, 175);
    color: #495AEE;
  }
  
  .loader::before {
    content: "Loading";
    display: inline-block;
    animation: l10-2 2s infinite;
    color: #929BEC;
  }
  
  .loader::after {
    content: "";
    position: absolute;
    width: 34px;
    height: 28px;
    top: 110%;
    left: calc(50% - 16px);
    background: linear-gradient(
          90deg,
          #0000 12px,
          #1F02F7 0 22px,
          #0000 0 26px,
          #495AEE 0 32px,
          #0000
        )
        bottom 26px left 50%,
      linear-gradient(90deg, #0000 10px, #1F02F7 0 28px, #495AEE 0 32px, #0000 0)
        bottom 24px left 50%,
      linear-gradient(
          90deg,
          #0000 10px,
          #0B0227 0 16px,
          #495AEE 0 20px,
          #000 0 22px,
          #495AEE 0 24px,
          #000 0 26px,
          #1F02F7 0 32px,
          #0000 0
        )
        bottom 22px left 50%,
      linear-gradient(
          90deg,
          #0000 8px,
          #0B0227 0 10px,
          #495AEE 0 12px,
          #0B0227 0 14px,
          #495AEE 0 20px,
          #000 0 22px,
          #495AEE 0 28px,
          #1F02F7 0 32px,
          #0000 0
        )
        bottom 20px left 50%,
      linear-gradient(
          90deg,
          #0000 8px,
          #0B0227 0 10px,
          #495AEE 0 12px,
          #0B0227 0 16px,
          #495AEE 0 22px,
          #000 0 24px,
          #495AEE 0 30px,
          #1F02F7 0 32px,
          #0000 0
        )
        bottom 18px left 50%,
      linear-gradient(
          90deg,
          #0000 8px,
          #0B0227 0 12px,
          #495AEE 0 20px,
          #000 0 28px,
          #1F02F7 0 30px,
          #0000 0
        )
        bottom 16px left 50%,
      linear-gradient(90deg, #0000 12px, #495AEE 0 26px, #1F02F7 0 30px, #0000 0)
        bottom 14px left 50%,
      linear-gradient(
          90deg,
          #495AEE 6px,
          #1F02F7 0 14px,
          #929BEC 0 16px,
          #1F02F7 0 22px,
          #929BEC 0 24px,
          #1F02F7 0 28px,
          #0000 0 32px,
          #0B0227 0
        )
        bottom 12px left 50%,
      linear-gradient(
          90deg,
          #495AEE 6px,
          #1F02F7 0 16px,
          #929BEC 0 18px,
          #1F02F7 0 24px,
          #1F02F7 0 26px,
          #0000 0 30px,
          #0B0227 0
        )
        bottom 10px left 50%,
      linear-gradient(
          90deg,
          #0000 10px,
          #1F02F7 0 16px,
          #929BEC 0 24px,
          #DCE2F4 0 26px,
          #929BEC 0 30px,
          #0B0227 0
        )
        bottom 8px left 50%,
      linear-gradient(
          90deg,
          #0000 12px,
          #929BEC 0 18px,
          #DCE2F4 0 20px,
          #929BEC 0 30px,
          #0B0227 0
        )
        bottom 6px left 50%,
      linear-gradient(90deg, #0000 8px, #0B0227 0 12px, #929BEC 0 30px, #0B0227 0)
        bottom 4px left 50%,
      linear-gradient(90deg, #0000 6px, #0B0227 0 14px, #929BEC 0 26px, #0000 0)
        bottom 2px left 50%,
      linear-gradient(90deg, #0000 6px, #0B0227 0 10px, #0000 0) bottom 0px left 50%;
    background-size: 34px 2px;
    background-repeat: no-repeat;
    animation: inherit;
    animation-name: l10-1;
  }
  
  @keyframes l10-0 {
    0%,
    30% {
      background-position: 0 0px;
    }
    50%,
    100% {
      background-position: 0 -0.1px;
    }
  }
  
  @keyframes l10-1 {
    50%,
    100% {
      top: 109.5%;
    }
  }
  
  @keyframes l10-2 {
    0%,
    30% {
      transform: translateY(0);
    }
    80%,
    100% {
      transform: translateY(-260%);
    }
  }
`;

export default LoadingScreen;