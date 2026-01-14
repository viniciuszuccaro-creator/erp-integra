import React from 'react';

export default function WindowApp({ url }) {
  return (
    <div className="w-full h-full">
      <iframe src={url} title="App" className="w-full h-full border-0" />
    </div>
  );
}