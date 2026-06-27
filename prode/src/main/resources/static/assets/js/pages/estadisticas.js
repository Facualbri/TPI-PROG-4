const EstadisticasPage = {
  cleanup() {
    ChartHelper.destroyAll();
  },
  async render(app) {
    Navbar.render();
    const content = document.getElementById('page-content');
    content.innerHTML = '<div class="loading-container"><div class="spinner spinner-lg"></div></div>';

    try {
      const results = await Promise.allSettled([
        Api.get('/pronosticos/mis-pronosticos'),
        Api.get('/ranking/global'),
      ]);

      const pronosticos = results[0].status === 'fulfilled' ? results[0].value : [];
      const globalRanking = results[1].status === 'fulfilled' ? results[1].value : [];

      const user = Auth.getUser();
      const userRanking = globalRanking.find(r => r.username === user?.username);

      const total = pronosticos.length;
      const aciertos = pronosticos.filter(p => p.puntos > 0).length;
      const pct = total > 0 ? Math.round((aciertos / total) * 100) : 0;
      const totalPts = pronosticos.reduce((s, p) => s + (p.puntos || 0), 0);

      const finalizados = pronosticos.filter(p => p.estadoPartido === 'FINALIZADO' || p.estadoPartido === 'FINALIZADA');
      const enJuego = pronosticos.filter(p => p.estadoPartido === 'EN_JUEGO');
      const porJugar = pronosticos.filter(p => p.estadoPartido === 'POR_JUGARSE' || p.estadoPartido === 'PROGRAMADA');

      content.innerHTML = `
        <div class="page-header">
          <div>
            <h1>Estadísticas</h1>
            <p>Tu rendimiento en el Prode</p>
          </div>
        </div>

        <div class="stats-grid" style="grid-template-columns:repeat(4,1fr)">
          <div class="stat-card">
            <div class="stat-value">${total}</div>
            <div class="stat-label">Total pronósticos</div>
          </div>
          <div class="stat-card">
            <div class="stat-value" style="background:var(--color-primary-gradient);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">${aciertos}</div>
            <div class="stat-label">Aciertos</div>
          </div>
          <div class="stat-card">
            <div class="stat-value" style="background:var(--color-accent-gradient);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">${pct}%</div>
            <div class="stat-label">Efectividad</div>
          </div>
          <div class="stat-card">
            <div class="stat-value" style="background:linear-gradient(135deg,#f59e0b,#ef4444);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">${totalPts}</div>
            <div class="stat-label">Puntos totales</div>
          </div>
        </div>

        <div class="stats-chart-grid">
          <div class="stats-chart-card">
            <h3>Distribución de pronósticos</h3>
            <canvas id="chart-distribucion"></canvas>
          </div>
          <div class="stats-chart-card">
            <h3>Efectividad vs. participantes</h3>
            <canvas id="chart-posicion"></canvas>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Detalle de pronósticos</h3>
          </div>
          <div class="table-wrapper">
            <table class="ranking-table">
              <thead>
                <tr>
                  <th>Estado</th>
                  <th>Cantidad</th>
                  <th>Porcentaje</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><span class="badge badge-success">Finalizados</span></td>
                  <td class="font-bold">${finalizados.length}</td>
                  <td class="text-muted">${total > 0 ? Math.round(finalizados.length / total * 100) : 0}%</td>
                </tr>
                <tr>
                  <td><span class="badge badge-warning">En juego</span></td>
                  <td class="font-bold">${enJuego.length}</td>
                  <td class="text-muted">${total > 0 ? Math.round(enJuego.length / total * 100) : 0}%</td>
                </tr>
                <tr>
                  <td><span class="badge badge-info">Por jugarse</span></td>
                  <td class="font-bold">${porJugar.length}</td>
                  <td class="text-muted">${total > 0 ? Math.round(porJugar.length / total * 100) : 0}%</td>
                </tr>
                <tr>
                  <td><span class="badge badge-success">Acertados</span></td>
                  <td class="font-bold" style="color:var(--color-primary)">${aciertos}</td>
                  <td class="text-muted">${total > 0 ? Math.round(aciertos / total * 100) : 0}%</td>
                </tr>
                <tr>
                  <td><span class="badge badge-danger">No acertados</span></td>
                  <td class="font-bold" style="color:var(--color-danger)">${finalizados.length - aciertos}</td>
                  <td class="text-muted">${finalizados.length > 0 ? Math.round((finalizados.length - aciertos) / finalizados.length * 100) : 0}%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      `;

      setTimeout(() => {
        ChartHelper.create('chart-distribucion', {
          type: 'doughnut',
          data: {
            labels: ['Finalizados', 'En juego', 'Por jugarse'],
            datasets: [{
              data: [finalizados.length, enJuego.length, porJugar.length],
              backgroundColor: ['#22c55e', '#f59e0b', '#3b82f6'],
              borderColor: '#1e293b',
              borderWidth: 2,
            }],
          },
          options: {
            ...ChartHelper.defaultOptions(),
            plugins: {
              ...ChartHelper.defaultOptions().plugins,
              legend: { position: 'bottom', labels: { color: '#94a3b8', padding: 16 } },
            },
          },
        });

        const aciertosPct = finalizados.length > 0 ? Math.round(aciertos / finalizados.length * 100) : 0;
        const noAciertosPct = finalizados.length > 0 ? 100 - aciertosPct : 0;

        ChartHelper.create('chart-posicion', {
          type: 'bar',
          data: {
            labels: ['Tu efectividad'],
            datasets: [{
              label: 'Aciertos',
              data: [aciertosPct],
              backgroundColor: '#22c55e',
              borderRadius: 6,
            }, {
              label: 'No acertados',
              data: [noAciertosPct],
              backgroundColor: '#ef4444',
              borderRadius: 6,
            }],
          },
          options: {
            ...ChartHelper.defaultOptions(),
            indexAxis: 'y',
            scales: {
              x: { stacked: true, max: 100, grid: { color: 'rgba(51, 65, 85, 0.5)' }, ticks: { color: '#64748b', callback: (v) => v + '%' } },
              y: { stacked: true, grid: { display: false }, ticks: { color: '#94a3b8' } },
            },
            plugins: {
              legend: { position: 'bottom', labels: { color: '#94a3b8', padding: 16 } },
            },
          },
        });
      }, 100);
    } catch (err) {
      content.innerHTML = `<div class="alert alert-error">${Helpers.escapeHtml(Helpers.getErrorMsg(err))}</div>`;
    }
  },
};
