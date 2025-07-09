module.exports = {
  apps: [{
    name: 'exitosa-despachos',
    script: 'npm',
    args: 'start',
    cwd: '/home/Sistemas_Radio_Exitosa_2025',
    exec_mode: 'fork', // Explícitamente usar fork mode
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 5451,
      DATABASE_URL: 'postgresql://despachos:147ABC55@localhost:9134/control_despachos',
      JWT_SECRET: 'sk-proj-xKj9Hm2Lp4Qr7Vw3Yz8Ab5Cd1Ef6Gh0Ij2Kl4Mn7Op3Qs9Rt5Uv8Wx1Ya4Zb6Dc9Fe2Hg5Jk8Lm0Np3Qr6St9Vw2Xy5Za8Bc1De4Fg7Hj0Km3Lp6Nq9Rs2Tv5Uw8Xy1Zb4Ce7Df0Gh3Ik6Jl9Mn2Op5Qr8St1Uv4Wx7Ya0Zc3Df6Eg9Hj2Kl5Mo8Np1Qs4Rt7Uw0Vx3Yb6Ze9Cf2Dg5Hi8Jk1Lm4No7Pq0Rs3Tv6Ux9Wy2Za5Bc8De1Fh4Gj7Km0Ln3Mp6Nq9St2Uv5Wx8Ya1Zb4Ce7Df0Gh3Ik6Jl9Mn2Op5Qr8St1Uv4Wx7Ya0',
      NEXTAUTH_URL: 'http://192.168.10.188:5451'
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
}