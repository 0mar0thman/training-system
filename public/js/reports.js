document.addEventListener('DOMContentLoaded', () => {
    // Initialize Icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // Chart Common Options
    Chart.defaults.font.family = "'Inter', sans-serif";
    Chart.defaults.color = '#64748b'; // slate-500
    Chart.defaults.scale.grid.color = '#f1f5f9'; // slate-100

    // -------------------------------------------------------------
    // Chart A: Revenue by Month (Bar Chart)
    // -------------------------------------------------------------
    const revenueCtx = document.getElementById('revenueChart');
    if (revenueCtx) {
        new Chart(revenueCtx, {
            type: 'bar',
            data: {
                labels: ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                datasets: [{
                    label: 'Revenue ($)',
                    data: [150000, 180000, 145000, 220000, 250000, 310000],
                    backgroundColor: '#0a0e17', // Dark/Black
                    borderRadius: 4,
                    barPercentage: 0.6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            usePointStyle: true,
                            boxWidth: 8,
                            padding: 20,
                            font: { size: 12, weight: '600' }
                        }
                    },
                    tooltip: {
                        backgroundColor: '#0a0e17',
                        padding: 12,
                        callbacks: {
                            label: function(context) {
                                let label = context.dataset.label || '';
                                if (label) label += ': ';
                                if (context.parsed.y !== null) {
                                    label += new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(context.parsed.y);
                                }
                                return label;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            maxTicksLimit: 8,
                            callback: function(value) {
                                return '$' + (value / 1000) + 'k';
                            },
                            font: { size: 11 }
                        },
                        border: { display: false }
                    },
                    x: {
                        grid: { display: false },
                        border: { display: false },
                        ticks: { font: { size: 12 } }
                    }
                }
            }
        });
    }

    // -------------------------------------------------------------
    // Chart B: Popular Courses (Donut Chart)
    // -------------------------------------------------------------
    const coursesCtx = document.getElementById('coursesChart');
    if (coursesCtx) {
        const donutData = [45, 25, 20, 10];
        const donutLabels = ['Leadership', 'Safety', 'Tech Skills', 'Other'];
        const donutColors = ['#0a0e17', '#ab8038', '#cbd5e1', '#f1f5f9'];

        new Chart(coursesCtx, {
            type: 'doughnut',
            data: {
                labels: donutLabels,
                datasets: [{
                    data: donutData,
                    backgroundColor: donutColors,
                    borderWidth: 0,
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '65%',
                plugins: {
                    legend: { display: false }, // Using custom legend below
                    tooltip: {
                        backgroundColor: '#0a0e17',
                        padding: 12,
                        callbacks: {
                            label: function(context) {
                                return ` ${context.label}: ${context.parsed}%`;
                            }
                        }
                    }
                }
            }
        });

        // Custom Legend for Donut Chart
        const legendContainer = document.getElementById('coursesLegend');
        if (legendContainer) {
            let legendHTML = '';
            donutLabels.forEach((label, i) => {
                legendHTML += `
                    <div class="flex items-center gap-1.5 text-xs font-semibold text-gray-600">
                        <span class="w-3 h-3 rounded-full" style="background-color: ${donutColors[i]}"></span>
                        ${label}
                    </div>
                `;
            });
            legendContainer.innerHTML = legendHTML;
        }
    }

    // -------------------------------------------------------------
    // Chart C: Trainee Enrollment Trend (Line Chart)
    // -------------------------------------------------------------
    const enrollmentCtx = document.getElementById('enrollmentChart');
    if (enrollmentCtx) {
        // Create gradient fill
        let gradientFill;
        const ctx = enrollmentCtx.getContext('2d');
        if (ctx) {
            gradientFill = ctx.createLinearGradient(0, 0, 0, 300);
            gradientFill.addColorStop(0, 'rgba(171, 128, 56, 0.2)');
            gradientFill.addColorStop(1, 'rgba(171, 128, 56, 0)');
        }

        new Chart(enrollmentCtx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                datasets: [{
                    label: 'New Enrollments',
                    data: [120, 150, 180, 165, 210, 250, 280, 255, 320, 350, 380, 420],
                    borderColor: '#ab8038',
                    backgroundColor: gradientFill || 'rgba(171, 128, 56, 0.1)',
                    borderWidth: 2.5,
                    fill: true,
                    tension: 0.2, // Slight curve, mostly straight
                    pointBackgroundColor: '#ffffff',
                    pointBorderColor: '#ab8038',
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            usePointStyle: true,
                            boxWidth: 8,
                            padding: 20,
                            font: { size: 12, weight: '600' }
                        }
                    },
                    tooltip: {
                        backgroundColor: '#0a0e17',
                        padding: 12,
                        displayColors: false,
                        callbacks: {
                            label: function(context) {
                                return ` ${context.parsed.y} Enrollments`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 450,
                        ticks: {
                            stepSize: 50,
                            font: { size: 11 }
                        },
                        border: { display: false }
                    },
                    x: {
                        grid: { display: false },
                        border: { display: false },
                        ticks: { font: { size: 12 } }
                    }
                }
            }
        });
    }
});
