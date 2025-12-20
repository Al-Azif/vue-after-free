#!/usr/bin/env python3
"""Send inject.js to PS4 for execution"""
import asyncio
import sys
import os
import websockets


async def send_inject(host, port, inject_file):
    uri = f"ws://{host}:{port}"
    print(f"[*] Connecting to {uri}...")

    async with websockets.connect(uri) as ws:
        print("[+] Connected!")

        # Drain buffered messages
        while True:
            try:
                msg = await asyncio.wait_for(ws.recv(), timeout=0.1)
                print(f"[<] {msg}")
            except asyncio.TimeoutError:
                break

        # Read inject.js
        with open(inject_file, "r") as f:
            code = f.read()

        # Send with type byte '1' (execute JavaScript)
        payload = "1" + code
        print(f"[*] Sending {inject_file} ({len(code)} bytes)...")
        await ws.send(payload)

        # Wait for responses
        try:
            while True:
                msg = await asyncio.wait_for(ws.recv(), timeout=3)
                print(f"[<] {msg}")
                if "successfully" in msg.lower() or "error" in msg.lower():
                    break
        except asyncio.TimeoutError:
            print("[!] Timeout waiting for response")

        print("[*] Done")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: sendjs.py <js_file> [host] [port]")
        print("  sendjs.py inject.js")
        print("  sendjs.py inject.js 192.168.0.100")
        print("  sendjs.py inject.js 192.168.0.100 40404")
        sys.exit(1)

    inject_file = sys.argv[1]
    host = sys.argv[2] if len(sys.argv) > 2 else "192.168.0.103"
    port = sys.argv[3] if len(sys.argv) > 3 else "40404"

    if not os.path.isfile(inject_file):
        print(f"[!] Error: {inject_file} not found")
        sys.exit(1)

    asyncio.run(send_inject(host, port, inject_file))
