import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';

import {_tasks, _posts, _timeline} from 'src/_mock';
import {DashboardContent} from 'src/layouts/dashboard';

import {AnalyticsNews} from '../analytics-news';
import {AnalyticsTasks} from '../analytics-tasks';
import {AnalyticsCurrentVisits} from '../analytics-current-visits';
import {AnalyticsOrderTimeline} from '../analytics-order-timeline';
import {AnalyticsWebsiteVisits} from '../analytics-website-visits';
import {AnalyticsWidgetSummary} from '../analytics-widget-summary';
import {AnalyticsTrafficBySite} from '../analytics-traffic-by-site';
import {AnalyticsCurrentSubject} from '../analytics-current-subject';
import {AnalyticsConversionRates} from '../analytics-conversion-rates';

// ----------------------------------------------------------------------

export function OverviewAnalyticsView() {
  return (
    <DashboardContent maxWidth="xl">
      <Typography variant="h4" sx={{mb: {xs: 3, md: 5}}}>
        おかえりなさい 👋
      </Typography>

      <Grid container spacing={3}>
        <Grid xs={12} sm={6} md={3}>
          <AnalyticsWidgetSummary
            title="CPU使用率"
            value={32}
            unit="%"
            color="primary"
            icon={<img alt="icon" src="/assets/icons/glass/ic-glass-users.svg"/>}
            chart={{
              categories: ['12:00', '12:05', '12:10', '12:15', '12:20', '12:25', '12:30'],
              series: [56, 47, 40, 62, 73, 30, 23],
            }}
          />
        </Grid>

        <Grid xs={12} sm={6} md={3}>
          <AnalyticsWidgetSummary
            title="メモリ使用率"
            value={52}
            unit="%"
            color="secondary"
            icon={<img alt="icon" src="/assets/icons/glass/ic-glass-users.svg"/>}
            chart={{
              categories: ['12:00', '12:05', '12:10', '12:15', '12:20', '12:25', '12:30'],
              series: [5.3, 5.3, 5.4, 5.5, 5.4, 5.4, 5.6],
            }}
          />
        </Grid>

        <Grid xs={12} sm={6} md={3}>
          <AnalyticsWidgetSummary
            title="ストレージ使用量"
            value={132}
            unit="GB"
            color="warning"
            icon={<img alt="icon" src="/assets/icons/glass/ic-glass-buy.svg"/>}
            chart={{
              categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
              series: [40, 70, 50, 28, 70, 75, 7, 64],
            }}
          />
        </Grid>

        <Grid xs={12} sm={6} md={3}>
          <AnalyticsWidgetSummary
            title="Messages"
            percent={3.6}
            value={234}
            color="error"
            icon={<img alt="icon" src="/assets/icons/glass/ic-glass-message.svg"/>}
            chart={{
              categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
              series: [56, 30, 23, 54, 47, 40, 62, 73],
            }}
          />
        </Grid>

        <Grid xs={12} md={6} lg={4}>
          <AnalyticsCurrentVisits
            title="Current visits"
            chart={{
              series: [
                {label: 'America', value: 3500},
                {label: 'Asia', value: 2500},
                {label: 'Europe', value: 1500},
                {label: 'Africa', value: 500},
              ],
            }}
          />
        </Grid>

        <Grid xs={12} md={6} lg={8}>
          <AnalyticsWebsiteVisits
            title="Website visits"
            subheader="(+43%) than last year"
            chart={{
              categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
              series: [
                {name: 'Team A', data: [43, 33, 22, 37, 67, 68, 37, 24, 55]},
                {name: 'Team B', data: [51, 70, 47, 67, 40, 37, 24, 70, 24]},
              ],
            }}
          />
        </Grid>

        <Grid xs={12} md={6} lg={8}>
          <AnalyticsConversionRates
            title="Conversion rates"
            subheader="(+43%) than last year"
            chart={{
              categories: ['Italy', 'Japan', 'China', 'Canada', 'France'],
              series: [
                {name: '2022', data: [44, 55, 41, 64, 22]},
                {name: '2023', data: [53, 32, 33, 52, 13]},
              ],
            }}
          />
        </Grid>

        <Grid xs={12} md={6} lg={4}>
          <AnalyticsCurrentSubject
            title="Current subject"
            chart={{
              categories: ['English', 'History', 'Physics', 'Geography', 'Chinese', 'Math'],
              series: [
                {name: 'Series 1', data: [80, 50, 30, 40, 100, 20]},
                {name: 'Series 2', data: [20, 30, 40, 80, 20, 80]},
                {name: 'Series 3', data: [44, 76, 78, 13, 43, 10]},
              ],
            }}
          />
        </Grid>

        <Grid xs={12} md={6} lg={8}>
          <AnalyticsNews title="News" list={_posts.slice(0, 5)}/>
        </Grid>

        <Grid xs={12} md={6} lg={4}>
          <AnalyticsOrderTimeline title="Order timeline" list={_timeline}/>
        </Grid>

        <Grid xs={12} md={6} lg={4}>
          <AnalyticsTrafficBySite
            title="Traffic by site"
            list={[
              {value: 'facebook', label: 'Facebook', total: 323234},
              {value: 'google', label: 'Google', total: 341212},
              {value: 'linkedin', label: 'Linkedin', total: 411213},
              {value: 'twitter', label: 'Twitter', total: 443232},
            ]}
          />
        </Grid>

        <Grid xs={12} md={6} lg={8}>
          <AnalyticsTasks title="Tasks" list={_tasks}/>
        </Grid>
      </Grid>
    </DashboardContent>
  );
}
