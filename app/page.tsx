'use client'
// app/page.tsx
import { useEffect, useRef, useState } from 'react';

const PoetryStreamPage = () => {
    const outputRef = useRef<HTMLDivElement>(null);
    const [query, setQuery] = useState('');
    const [source, setSource] = useState<EventSource | null>(null);

    const handleSubmit = () => {
        if (source) {
            source.close(); // 如果已经有连接，先关闭
        }

        // 清空输出区域
        if (outputRef.current) {
            outputRef.current.innerHTML = '';
        }

        const newSource = new EventSource(`https://longllmai-tutorial.lininruc.workers.dev/stream?query=${encodeURIComponent(query)}`);
        setSource(newSource);

        newSource.onmessage = (event) => {
            if (event.data === "[DONE]") {
                newSource.close(); // 关闭连接
                return;
            }

            const data = JSON.parse(event.data);
            if (outputRef.current) {
                // 将换行符替换为 <br /> 标签
                const formattedResponse = data.response.replace(/\n/g, '<br />');
                outputRef.current.innerHTML += formattedResponse; // 将新数据追加到输出区域
            }
        };

        // 清理函数：组件卸载时关闭 SSE 连接
        return () => {
            newSource.close();
        };
    };

    useEffect(() => {
        // 清理函数：组件卸载时关闭 SSE 连接
        return () => {
            if (source) {
                source.close();
            }
        };
    }, [source]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <h1 className="text-2xl font-bold mb-4">流式输出的内容</h1>
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="p-2 border border-gray-300 rounded mb-4"
                placeholder="输入你的查询"
            />
            <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-blue-500 text-white rounded"
            >
                提交
            </button>
            <div
                ref={outputRef}
                className="w-full max-w-2xl p-4 bg-white border border-gray-300 rounded-lg shadow-md overflow-y-auto"
                style={{ maxHeight: '400px' }}
            >
                {/* 流式输出内容将会在这里显示 */}
            </div>
        </div>
    );
};

export default PoetryStreamPage;